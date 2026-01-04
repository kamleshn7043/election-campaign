(function protectAdmin()
{
  const token = localStorage.getItem("admin_token");
  const role = localStorage.getItem("admin_role");

  if (window.location.pathname.startsWith("/admin/html/"))
  {
    if (!token || role !== "admin")
    {
      window.location.href = "/admin/html/login.html";
    }
  }
})();




let PAGE_SIZE = 20;
let currentPage = 1;


function login()
{
  const mobile = document.getElementById("mobile").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorMsg = document.getElementById("errorMsg");

  if (!mobile || !password)
  {
    errorMsg.innerText = "❌ Enter mobile & password";
    errorMsg.style.color = "red";
    return;
  }

  fetch("/api/admin/login",
  {
    method: "POST",
    headers:
    {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ mobile, password })
  })
    .then(res => res.json())
    .then(data =>
    {
      if (data.token)
      {
        localStorage.setItem("admin_token", data.token);
        localStorage.setItem("admin_role", "admin");
        window.location.href = "/admin/html/dashboard.html";
      }
      else
      {
        errorMsg.innerText = data.message || "Login failed";
        errorMsg.style.color = "red";
      }
    })
    .catch(() =>
    {
      errorMsg.innerText = "❌ Server error";
      errorMsg.style.color = "red";
    });
}


function logout()
{
  localStorage.removeItem("admin_token");
  localStorage.removeItem("admin_role");
  window.location.href = "login.html";
}


function goAddVoter()
{
  window.location.href = "add-voter.html";
}

function goViewVoters()
{
  window.location.href = "view-voters.html";
}


function goDashboard()
{
  window.location.href = "dashboard.html";
}

function goReports()
{
  window.location.href = "reports.html";
}

function goCreateWorker()
{
  window.location.href = "create-worker.html";
}

function goUploadExcel()
{
  window.location.href = "upload-excel.html";
}





function saveVoter()
{
  const name = document.getElementById("name").value.trim();
  const age = document.getElementById("age").value;
  const gender = document.getElementById("gender").value;
  const address = document.getElementById("address").value.trim();
  const mobile = document.getElementById("mobile").value.trim();
  const area = document.getElementById("area").value.trim();
  const support = document.getElementById("support").value;
  const msg = document.getElementById("msg");

  if (!name || !age || !gender || !address || !mobile || !area || !support)
  {
    msg.style.color = "red";
    msg.innerText = "❌ Please fill all fields";
    return;
  }

  fetch("/api/voters/add",
  {
    method: "POST",
    headers:
    {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem("admin_token")
    },
    body: JSON.stringify(
    {
      name,
      age,
      gender,
      address,
      mobile,
      area,
      support
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.message)
      {
        msg.style.color = "green";
        msg.innerText = data.message;

        document.querySelectorAll(
          ".form-container input, .form-container select"
        ).forEach(e => e.value = "");
      }
      else
      {
        msg.style.color = "red";
        msg.innerText = "❌ Failed to save voter";
      }
    })
    .catch(() =>
    {
      msg.style.color = "red";
      msg.innerText = "❌ Server error";
    });
}



function loadVoters(reset = true)
{
  const table = document.getElementById("voterTable");
  const noData = document.getElementById("noData");
  const loadMoreBtn = document.getElementById("loadMoreBtn");
  const areaSelect = document.getElementById("areaFilter");
  const searchInput = document.getElementById("searchInput");

  if (!table) return;
  if (reset) currentPage = 1;

  fetch("/api/voters/all",
  {
    headers:
    {
      "Authorization": "Bearer " + localStorage.getItem("admin_token")
    }
  })
    .then(res => res.json())
    .then(voters =>
    {
      if (!Array.isArray(voters) || voters.length === 0)
      {
        table.innerHTML = "";
        noData.innerText = "No voters found";
        loadMoreBtn.style.display = "none";
        return;
      }

      
      
      if (areaSelect && areaSelect.options.length === 1)
      {
        const areas = [...new Set(
          voters.map(v => v.area).filter(Boolean)
        )];

        areas.forEach(a =>
        {
          const opt = document.createElement("option");
          opt.value = a;
          opt.textContent = a;
          areaSelect.appendChild(opt);
        });
      }

      
      
      let filtered = voters;

      const area = areaSelect ? areaSelect.value : "ALL";
      if (area !== "ALL")
      {
        filtered = filtered.filter(v => v.area === area);
      }

      const q = searchInput ? searchInput.value.trim().toLowerCase() : "";
      if (q)
      {
        filtered = filtered.filter(v =>
          (v.name || "").toLowerCase().includes(q) ||
          (v.mobile || "").includes(q) ||
          (v.address || "").toLowerCase().includes(q) ||
          (v.area || "").toLowerCase().includes(q)
        );
      }

      
      
      const end = PAGE_SIZE * currentPage;
      const pageData = filtered.slice(0, end);

      table.innerHTML = "";
      noData.innerText = "";


pageData.forEach((v, i) =>
{
  table.innerHTML += `
    <tr id="row-${v.voter_id}" data-edit="false">
      <td>${i + 1}</td>

      <td><span id="name-txt-${v.voter_id}">${v.name}</span></td>
      <td><span id="age-txt-${v.voter_id}">${v.age}</span></td>
      <td><span id="gender-txt-${v.voter_id}">${v.gender}</span></td>
      <td><span id="address-txt-${v.voter_id}">${v.address}</span></td>
      <td>${v.mobile}</td>
      <td><span id="area-txt-${v.voter_id}">${v.area}</span></td>

      <td>
        <select id="support-${v.voter_id}">
          <option ${v.support==="Support"?"selected":""}>Support</option>
          <option ${v.support==="Neutral"?"selected":""}>Neutral</option>
          <option ${v.support==="Oppose"?"selected":""}>Oppose</option>
        </select>
      </td>

      <td id="action-${v.voter_id}">
        <button onclick="enableEdit(${v.voter_id})">✏️ Update</button>
        <button class="delete-btn"
          onclick="adminDeleteVoter(${v.voter_id})">🗑️ Delete</button>
      </td>
    </tr>
  `;
});


      loadMoreBtn.style.display =
        pageData.length < filtered.length ? "inline-block" : "none";
    })
    .catch(() =>
    {
      noData.innerText = "❌ Server error";
    });
}




function clearAllVoters()
{
  const step1 = confirm(
    "⚠️ Are you sure?\nThis will DELETE ALL voters permanently."
  );

  if (!step1) return;

  const step2 = prompt(
    "Type CONFIRM to delete all voters"
  );

  if (step2 !== "CONFIRM")
  {
    alert("❌ Action cancelled");
    return;
  }




  alert("✅ All voters deleted successfully");

  loadVoters();
}





function deleteVoter(index)
{
  let voters = JSON.parse(localStorage.getItem("voters")) || [];
  voters.splice(index, 1);
  localStorage.setItem("voters", JSON.stringify(voters));
  loadVoters();
}


function createWorker()
{
  const name = document.getElementById("wName").value.trim();
  const mobile = document.getElementById("wMobile").value.trim();
  const password = document.getElementById("wPass").value.trim();
  const area = document.getElementById("wArea").value.trim();
  const msg = document.getElementById("msg");

  if (!name || !mobile || !password || !area)
  {
    msg.style.color = "red";
    msg.innerText = "❌ Please fill all fields";
    return;
  }

  fetch("/api/worker/create",
  {
    method: "POST",
    headers:
    {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem("admin_token")
    },
    body: JSON.stringify({ name, mobile, password, area })
  })
    .then(res => res.json())
    .then(data =>
    {
      if (data.message)
      {
        msg.style.color = "green";
        msg.innerText = data.message;

        document.querySelectorAll(
          ".form-container input"
        ).forEach(i => i.value = "");
      }
      else
      {
        msg.style.color = "red";
        msg.innerText = "❌ Failed to create worker";
      }
    })
    .catch(() =>
    {
      msg.style.color = "red";
      msg.innerText = "❌ Server error";
    });
}


function toggleSidebar()
{
  document.getElementById("sidebar").classList.toggle("open");
  document.getElementById("overlay").classList.toggle("show");
}

function loadMoreVoters()
{
  currentPage++;
  loadVoters(false);
}

document.addEventListener("DOMContentLoaded", loadVoters);






document.addEventListener("DOMContentLoaded", loadAdminStats);

function loadAdminStats()
{
  const totalEl = document.getElementById("totalVoters");
  if (!totalEl) return;

  const supportEl = document.getElementById("supportCount");
  const neutralEl = document.getElementById("neutralCount");
  const opposeEl = document.getElementById("opposeCount");

  fetch("/api/voters/all",
  {
    headers: 
    {
      "Authorization": "Bearer " + localStorage.getItem("admin_token")
    }
  })
    .then(res => res.json())
    .then(voters => {
      let s = 0, n = 0, o = 0;

      voters.forEach(v =>
      {
        if (v.support === "Support") s++;
        else if (v.support === "Neutral") n++;
        else if (v.support === "Oppose") o++;
      });

      totalEl.innerText = voters.length;
      supportEl.innerText = s;
      neutralEl.innerText = n;
      opposeEl.innerText = o;
    })
    .catch(() =>
    {
      console.log("Stats load failed");
    });
}



function updateSupportByMobile(mobile, value)
{
  let voters = JSON.parse(localStorage.getItem("voters")) || [];

  const voter = voters.find(v => v.mobile === mobile);
  if (!voter) return;

  voter.support = value;
  localStorage.setItem("voters", JSON.stringify(voters));

  console.log("Support updated:", mobile, value);

  loadAdminStats && loadAdminStats();
}



function adminDeleteVoter(id)
{
  if (!confirm("Delete this voter permanently?")) return;

  fetch(`/api/voters/delete/${id}`,
  {
    method: "DELETE",
    headers:
    {
      "Authorization": "Bearer " + localStorage.getItem("admin_token")
    }
  })
    .then(res => res.json())
    .then(data =>
    {
      alert(data.message);
      loadVoters();
    })
    .catch(() => alert("Server error"));
}




function adminUpdateSupport(id, support)
{
  fetch(`/api/voters/support/${id}`,
  {
    method: "PUT",
    headers:
    {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem("admin_token")
    },
    body: JSON.stringify({ support })
  })
    .then(res => res.json())
    .then(data => console.log(data.message))
    .catch(() => alert("Server error"));
}


function openEditVoter(id)
{
  window.location.href = `/admin/html/edit-voter.html?id=${id}`;
}


function adminUpdateVoter(id)
{
  const data =
  {
    name: document.getElementById(`name-${id}`).value.trim(),
    age: document.getElementById(`age-${id}`).value,
    gender: document.getElementById(`gender-${id}`).value,
    address: document.getElementById(`address-${id}`).value.trim(),
    area: document.getElementById(`area-${id}`).value.trim(),
    support: document.getElementById(`support-${id}`).value
  };

  fetch(`/api/voters/update/${id}`,
  {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem("admin_token")
    },
    body: JSON.stringify(data)
  })
    .then(res => res.json())
    .then(d => {
      alert(d.message || "Updated");
    })
    .catch(() => alert("❌ Server error"));
}


function enableEdit(id)
{
  const row = document.getElementById(`row-${id}`);

  const name = document.getElementById(`name-txt-${id}`).innerText;
  const age = document.getElementById(`age-txt-${id}`).innerText;
  const gender = document.getElementById(`gender-txt-${id}`).innerText;
  const address = document.getElementById(`address-txt-${id}`).innerText;
  const area = document.getElementById(`area-txt-${id}`).innerText;

  document.getElementById(`name-txt-${id}`).outerHTML =
    `<input id="name-${id}" value="${name}">`;

  document.getElementById(`age-txt-${id}`).outerHTML =
    `<input id="age-${id}" type="number" value="${age}" style="width:60px">`;

  document.getElementById(`gender-txt-${id}`).outerHTML =
    `<select id="gender-${id}">
      <option ${gender==="Male"?"selected":""}>Male</option>
      <option ${gender==="Female"?"selected":""}>Female</option>
      <option ${gender==="Other"?"selected":""}>Other</option>
    </select>`;

  document.getElementById(`address-txt-${id}`).outerHTML =
    `<input id="address-${id}" value="${address}">`;

  document.getElementById(`area-txt-${id}`).outerHTML =
    `<input id="area-${id}" value="${area}" style="width:80px">`;

  document.getElementById(`action-${id}`).innerHTML = `
    <button onclick="saveEdit(${id})">💾 Save</button>
    <button onclick="cancelEdit()">❌ Cancel</button>
  `;
}



function saveEdit(id)
{
  const data =
  {
    name: document.getElementById(`name-${id}`).value.trim(),
    age: document.getElementById(`age-${id}`).value,
    gender: document.getElementById(`gender-${id}`).value,
    address: document.getElementById(`address-${id}`).value.trim(),
    area: document.getElementById(`area-${id}`).value.trim(),
    support: document.getElementById(`support-${id}`).value
  };

  fetch(`/api/voters/update/${id}`,
  {
    method: "PUT",
    headers:
    {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem("admin_token")
    },
    body: JSON.stringify(data)
  })
    .then(async res =>
    {
      if (!res.ok) 
      {
        const err = await res.json();
        throw new Error(err.message || "Update failed");
      }
      return res.json();
    })
    .then(d =>
    {
      alert(d.message);
      loadVoters(); // refresh table
    })
    .catch(err =>
    {
      alert("❌ " + err.message);
    });
}


function cancelEdit()
{
  loadVoters();
}