function login()
{
  const mobile = document.getElementById("mobile").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorMsg = document.getElementById("errorMsg");

  if (!mobile || !password)
  {
    errorMsg.innerText = "❌ Enter mobile & password";
    return;
  }

  fetch("/api/admin/login",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mobile, password })
  })
    .then(res => res.json())
    .then(data =>
    {
      if (data.token)
      {
        localStorage.setItem("admin_token", data.token);
        localStorage.setItem("admin_role", "admin");
        window.location.href = "dashboard.html";
      }
      else
      {
        errorMsg.innerText = data.message || "Login failed";
      }
    })
    .catch(() =>
    {
      errorMsg.innerText = "Server error";
    });
}