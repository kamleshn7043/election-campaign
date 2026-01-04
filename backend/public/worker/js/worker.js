//WORKER AUTH PROTECTION
(function protectWorker()
{
  const token = localStorage.getItem("worker_token");
const role = localStorage.getItem("worker_role");


  if (window.location.pathname.includes("/worker/html/"))
  {
    if (window.location.pathname.includes("login.html")) return;

    if (!token || role !== "worker")
    {
      window.location.href = "/worker/html/login.html";
    }
  }
})();



//LOGIN
function workerLogin() {
  const mobile = document.getElementById("workerMobile").value.trim();
  const password = document.getElementById("workerPass").value.trim();
  const errorMsg = document.getElementById("errorMsg");

  if (!mobile || !password)
  {
    errorMsg.innerText = "❌ Mobile & Password required";
    errorMsg.style.color = "red";
    return;
  }

  fetch("/api/worker/login",
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
        localStorage.setItem("worker_token", data.token);
localStorage.setItem("worker_role", "worker");

window.location.href = "/worker/html/dashboard.html";
      } else
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




// LOGOUT
function logout()
{
  localStorage.removeItem("worker_token");
localStorage.removeItem("worker_role");

window.location.href = "/worker/html/login.html";

}


//SIDEBAR
function toggleSidebar()
{
  document.getElementById("sidebar")?.classList.toggle("open");
  document.getElementById("overlay")?.classList.toggle("show");
}



//NAVIGATION (NO BLINK)
function navigateWorker(page)
{
  location.href = page;
}



//HELPERS
// function getWorkerArea() {
//   return localStorage.getItem("workerArea");
// }



//WORKER STATS PAGE
document.addEventListener("DOMContentLoaded", () =>
{
  const totalEl = document.getElementById("totalVoters");
  if (!totalEl) return;

  const supportEl = document.getElementById("supportCount");
  const neutralEl = document.getElementById("neutralCount");
  const opposeEl = document.getElementById("opposeCount");

  fetchWorkerVoters(voters =>
  {
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
  });
});



//WORKER CHARTS PAGE
document.addEventListener("DOMContentLoaded", () =>
{
  const supportCanvas = document.getElementById("supportChart");
  const genderCanvas = document.getElementById("genderChart");
  const ageCanvas = document.getElementById("ageChart");
  const surnameCanvas = document.getElementById("surnameChart");

  if (!supportCanvas && !genderCanvas && !ageCanvas && !surnameCanvas) return;

  fetchWorkerVoters(voters =>
  {
    //SUPPORT
    if (supportCanvas)
    {
      let s=0,n=0,o=0;
      voters.forEach(v=>
      {
        if(v.support==="Support") s++;
        else if(v.support==="Neutral") n++;
        else if(v.support==="Oppose") o++;
      });

      new Chart(supportCanvas,
      {
        type:"pie",
        data:
        {
          labels:["Support","Neutral","Oppose"],
          datasets:[{ data:[s,n,o] }]
        },
        options:{maintainAspectRatio:false}
      });
    }



    //GENDER
    if (genderCanvas)
    {
      let m=0,f=0,o=0;
      voters.forEach(v=>
      {
        const g=(v.gender||"").toLowerCase();
        if(g==="male") m++;
        else if(g==="female") f++;
        else o++;
      });

      new Chart(genderCanvas,
      {
        type:"pie",
        data:
        {
          labels:["Male","Female","Other"],
          datasets:[{ data:[m,f,o] }]
        },
        options:{maintainAspectRatio:false}
      });
    }

    

    //Age
    if (ageCanvas)
    {
      let a=[0,0,0,0,0];
      voters.forEach(v=>
      {
        const age=Number(v.age);
        if(age<=25)a[0]++;
        else if(age<=35)a[1]++;
        else if(age<=45)a[2]++;
        else if(age<=60)a[3]++;
        else a[4]++;
      });

      new Chart(ageCanvas,
      {
        type:"bar",
        data:
        {
          labels:["18–25","26–35","36–45","46–60","60+"],
          datasets:[{ data:a }]
        },
        options:
        {
          maintainAspectRatio:false,
          plugins:{legend:{display:false}},
          scales:{y:{beginAtZero:true}}
        }
      });
    }


    //Surname
    if (surnameCanvas)
    {
      const map={};
      voters.forEach(v=>
      {
        const s=v.name?.split(" ")[0];
        if(s) map[s]=(map[s]||0)+1;
      });

      const top=Object.entries(map)
        .sort((a,b)=>b[1]-a[1])
        .slice(0,5);

      new Chart(surnameCanvas,
      {
        type:"pie",
        data:
        {
          labels:top.map(x=>x[0]),
          datasets:[{ data:top.map(x=>x[1]) }]
        },
        options:{maintainAspectRatio:false}
      });
    }

  });
});



//VIEW VOTERS
let WORKER_PAGE_SIZE = 20;
let workerCurrentPage = 1;

document.addEventListener("DOMContentLoaded", () =>
{
  if (document.getElementById("workerTable"))
  {
    loadWorkerVoters(true);
  }
});

function loadWorkerVoters(reset = true)
{
  const table = document.getElementById("workerTable");
  const searchInput = document.getElementById("searchInput");
  const loadMoreBtn = document.getElementById("loadMoreBtn");

  if (!table) return;
  if (reset) workerCurrentPage = 1;

  fetch("/api/worker/voters",
  {
    headers:
    {
      "Authorization": "Bearer " + localStorage.getItem("worker_token")
    }
  })
    .then(res => res.json())
    .then(voters =>
    {
      let data = voters;

      const q = searchInput?.value.trim().toLowerCase();
      if (q)
      {
        data = data.filter(v =>
          (v.name||"").toLowerCase().includes(q) ||
          (v.mobile||"").includes(q) ||
          (v.address||"").toLowerCase().includes(q)
        );
      }

      const end = WORKER_PAGE_SIZE * workerCurrentPage;
      const pageData = data.slice(0, end);

      table.innerHTML = "";

      if (pageData.length === 0)
      {
        table.innerHTML =
          `<tr><td colspan="8">No voters found</td></tr>`;
        if (loadMoreBtn) loadMoreBtn.style.display = "none";
        return;
      }

      pageData.forEach((v, i) =>
      {
        table.innerHTML += `
          <tr>
            <td>${i + 1}</td>
            <td>${v.name}</td>
            <td>${v.age}</td>
            <td>${v.gender}</td>
            <td>${v.address}</td>
            <td>${v.mobile}</td>
            <td>${v.area}</td>
            <td>
              <select onchange="updateWorkerSupport('${v.mobile}', this.value)">
                <option ${v.support==="Support"?"selected":""}>Support</option>
                <option ${v.support==="Neutral"?"selected":""}>Neutral</option>
                <option ${v.support==="Oppose"?"selected":""}>Oppose</option>
              </select>
            </td>
          </tr>
        `;
      });

      if (loadMoreBtn)
      {
        loadMoreBtn.style.display =
          pageData.length < data.length ? "inline-block" : "none";
      }
    })
    .catch(() =>
    {
      table.innerHTML =
        `<tr><td colspan="8">❌ Server error</td></tr>`;
    });
}



function loadMoreWorkerVoters(){
  workerCurrentPage++;
  loadWorkerVoters(false);
}


//UPDATE SUPPORT
function updateWorkerSupport(mobile, value)
{
  fetch(`/api/worker/support/${mobile}`,
  {
    method: "PUT",
    headers:
    {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem("worker_token")
    },
    body: JSON.stringify({ support: value })
  });
}

//Add Voter
function saveWorkerVoter() {
  const name = document.getElementById("name").value.trim();
  const age = document.getElementById("age").value;
  const gender = document.getElementById("gender").value;
  const address = document.getElementById("address").value.trim();
  const mobile = document.getElementById("mobile").value.trim();
  const support = document.getElementById("support").value;
  // const area = getWorkerArea();
  const msg = document.getElementById("msg");

  if (!name || !age || !gender || !address || !mobile || !support)
  {
    msg.innerText = "❌ Please fill all fields";
    msg.style.color = "red";
    return;
  }

  fetch("/api/voters/add",
  {
    method: "POST",
    headers:
    {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem("worker_token")
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
    .then(data =>
    {
      if (data.message)
      {
        msg.innerText = data.message;
        msg.style.color = "green";

        document.querySelectorAll(
          ".form-container input, .form-container select"
        ).forEach(e => e.value = "");
      } else
      {
        msg.innerText = "❌ Failed to add voter";
        msg.style.color = "red";
      }
    })
    .catch(() =>
    {
      msg.innerText = "❌ Server error";
      msg.style.color = "red";
    });
}


function goWorkerDashboard()
{
  location.href = "/worker/html/dashboard.html";
}


function fetchWorkerVoters(callback)
{
  fetch("/api/worker/voters",
  {
    headers:
    {
      "Authorization": "Bearer " + localStorage.getItem("worker_token")
    }
  })
    .then(res => res.json())
    .then(voters => callback(voters))
    .catch(err =>
    {
      console.error("Analytics fetch error", err);
    });
}



function workerLogout()
{
  localStorage.removeItem("worker_token");
  localStorage.removeItem("worker_role");
  localStorage.removeItem("workerArea");
  localStorage.removeItem("workerName");

   window.location.href = "/worker/html/login.html";
}
