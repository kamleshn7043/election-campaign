(function protectAdmin()
{
  if (window.location.pathname.includes("login.html")) return;

  const token = localStorage.getItem("admin_token");
  const role = localStorage.getItem("admin_role");

  if (!token || role !== "admin") {
    window.location.href = "/admin/html/login.html";
  }
})();