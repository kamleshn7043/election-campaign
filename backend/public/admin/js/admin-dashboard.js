function loadAdminStats()
{
  const token = localStorage.getItem("admin_token");
  if (!token) return;

  fetch("/api/voters/all",
  {
    headers:
    {
      Authorization: "Bearer " + token
    }
  })
    .then(res => res.json())
    .then(voters => {
      document.getElementById("totalVoters").innerText = voters.length;

      let s = 0, n = 0, o = 0;
      voters.forEach(v =>
      {
        if (v.support === "Support") s++;
        else if (v.support === "Neutral") n++;
        else if (v.support === "Oppose") o++;
      });

      document.getElementById("supportCount").innerText = s;
      document.getElementById("neutralCount").innerText = n;
      document.getElementById("opposeCount").innerText = o;
    })
    .catch(() =>
    {
      console.log("Stats load skipped");
    });
}


document.addEventListener("DOMContentLoaded", loadAdminStats);