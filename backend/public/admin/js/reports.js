let voters = [];

document.addEventListener("DOMContentLoaded", () =>
{
  
  const token =
  localStorage.getItem("admin_token") ||
  sessionStorage.getItem("admin_token");

  if (!token)
  {
    alert("Session expired. Please login again.");
    window.location.href = "/admin/html/login.html";
    return;
  }

  let reportLoaded = false;
  const areaSelect = document.getElementById("areaFilter");

  let supportChart, ageChart, genderChart, surnameChart;

  function fetchReports(retry = true)
  {
    if (reportLoaded) return;
    reportLoaded = true;

    fetch("/api/voters/all",
    {
      headers:
      {
        Authorization: "Bearer " + token
      }
    })
      .then(res =>
      {
        if (!res.ok) throw new Error("API Error: " + res.status);
        return res.json();
      })
      .then(data =>
      {
        voters = data.map(v => (
        {
          ...v,
          area: v.area ? v.area.trim() : "",
          gender: v.gender ? v.gender.trim().toLowerCase() : ""
        }));
        initReports();
      })
      .catch(err =>
      {
        console.error("REPORT FETCH ERROR:", err);
        if (retry)
        {
          reportLoaded = false;
          setTimeout(() => fetchReports(false), 500);
        }
        else
        {
          alert("❌ Failed to load report data");
        }
      });
  }

  fetchReports();

  function initReports()
  {
    areaSelect.innerHTML = `<option value="ALL">All Areas</option>`;

    const areas = [...new Set(voters.map(v => v.area).filter(Boolean))];
    areas.forEach(a =>
    {
      const o = document.createElement("option");
      o.value = a;
      o.textContent = a;
      areaSelect.appendChild(o);
    });

    areaSelect.onchange = () => renderAll(areaSelect.value);
    renderAll("ALL");
  }

  function getData(area)
  {
    return area === "ALL" ? voters : voters.filter(v => v.area === area);
  }

  function renderAll(area)
  {
    const data = getData(area);
    renderSupport(data);
    renderGender(data);
    renderAge(data);
    renderSurname(data);
  }

  
  function renderSupport(data)
  {
    let s=0,n=0,o=0;
    data.forEach(v=>
    {
      if(v.support==="Support") s++;
      else if(v.support==="Neutral") n++;
      else if(v.support==="Oppose") o++;
    });

    supportChart?.destroy();
    supportChart = new Chart(document.getElementById("supportChart"),
    {
      type:"pie",
      data:
      {
        labels:["Support","Neutral","Oppose"],
        datasets:[
        {
          data:[s,n,o],
          backgroundColor:["#22c55e","#facc15","#ef4444"]
        }]
      },
      options:{responsive:true,maintainAspectRatio:false}
    });
  }


  function renderGender(data)
  {
    let m=0,f=0,o=0;
    data.forEach(v=>
    {
      if(v.gender==="male") m++;
      else if(v.gender==="female") f++;
      else o++;
    });

    genderChart?.destroy();
    genderChart = new Chart(document.getElementById("genderChart"),
    {
      type:"pie",
      data:
      {
        labels:["Male","Female","Other"],
        datasets:[
        {
          data:[m,f,o],
          backgroundColor:["#60a5fa","#f472b6","#a78bfa"]
        }]
      },
      options:{responsive:true,maintainAspectRatio:false}
    });
  }


  function renderAge(data)
  {
    let a=[0,0,0,0,0];
    data.forEach(v=>
    {
      const x=Number(v.age);
      if(x<=25)a[0]++;
      else if(x<=35)a[1]++;
      else if(x<=45)a[2]++;
      else if(x<=60)a[3]++;
      else a[4]++;
    });

    
    ageChart?.destroy();
    ageChart = new Chart(document.getElementById("ageChart"),
    {
      type:"bar",
      data:
      {
        labels:["18–25","26–35","36–45","46–60","60+"],
        datasets:[{data:a,backgroundColor:"#60a5fa"}]
      },
      options:
      {
        responsive:true,
        maintainAspectRatio:false,
        plugins:{legend:{display:false}},
        scales:{y:{beginAtZero:true}}
      }
    });
  }



  function renderSurname(data)
  {
    const map={};
    data.forEach(v=>
    {
      const s=v.name?.split(" ")[0];
      if(s) map[s]=(map[s]||0)+1;
    });

    const top=Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,5);

    
    surnameChart?.destroy();
    surnameChart = new Chart(document.getElementById("surnameChart"),
    {
      type:"pie",
      data:
      {
        labels:top.map(x=>x[0]),
        datasets:[{data:top.map(x=>x[1])}]
      },
      options:{responsive:true,maintainAspectRatio:false}
    });
  }

});



function getFilteredVoters()
{
  const area = document.getElementById("areaFilter")?.value || "ALL";
  return area === "ALL"
    ? voters
    : voters.filter(v => v.area === area);
}


// function makePDF(title, headers, rows)
// {
//   const { jsPDF } = window.jspdf;
//   const doc = new jsPDF();
//   doc.setFontSize(14);
//   doc.text(title, 14, 15);
//   doc.autoTable({ startY: 25, head: [headers], body: rows });
//   doc.save(title.replace(/\s+/g, "_") + ".pdf");
// }


function makePDF(title, headers, rows)
{
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(14);
  doc.text(title, 14, 15);

  doc.autoTable({
    startY: 25,
    head: [headers],
    body: rows
  });

  // 🔥 ANDROID WEBVIEW FINAL FIX
  const pdfBlob = doc.output("blob");
  const blobUrl = URL.createObjectURL(pdfBlob);

  // 🔥 FORCE WEBVIEW NAVIGATION (IMPORTANT)
  window.location.href = blobUrl;
}


function downloadSupportReport()
{
  let s=0,n=0,o=0;
  getFilteredVoters().forEach(v=>
  {
    if(v.support==="Support") s++;
    else if(v.support==="Neutral") n++;
    else if(v.support==="Oppose") o++;
  });
  makePDF("Support Report",["Type","Count"],[
    ["Support",s],["Neutral",n],["Oppose",o]
  ]);
}



function downloadGenderReport()
{
  let m=0,f=0,o=0;
  getFilteredVoters().forEach(v=>
  {
    if(v.gender==="male") m++;
    else if(v.gender==="female") f++;
    else o++;
  });
  makePDF("Gender Report",["Gender","Count"],[
    ["Male",m],["Female",f],["Other",o]
  ]);
}

function downloadAgeReport()
{
  let a=[0,0,0,0,0];
  getFilteredVoters().forEach(v=>
  {
    const x=Number(v.age);
    if(x<=25)a[0]++;
    else if(x<=35)a[1]++;
    else if(x<=45)a[2]++;
    else if(x<=60)a[3]++;
    else a[4]++;
  });
  makePDF("Age Report",["Age Group","Count"],[
    ["18–25",a[0]],["26–35",a[1]],
    ["36–45",a[2]],["46–60",a[3]],["60+",a[4]]
  ]);
}



function downloadSurnameReport()
{
  const map={};
  getFilteredVoters().forEach(v=>
  {
    const s=v.name?.split(" ")[0];
    if(s) map[s]=(map[s]||0)+1;
  });
  const rows=Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,10);
  makePDF("Surname Report",["Surname","Count"],rows);
}