async function createUser()
{
  const name = document.getElementById("name").value;
  const mobile = document.getElementById("mobile").value;
  const password = document.getElementById("password").value;

  if (!name || !mobile || !password)
  {
    document.getElementById("msg").innerText = "❌ All fields required";
    return;
  }


  /*
  const res = await fetch("http://localhost:5000/api/users/create",
  {
    method: "POST",
    headers:
    {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem("token")
    },
    body: JSON.stringify({ name, mobile, password })
  });

  const data = await res.json();
  */

  document.getElementById("msg").innerText = "✅ User Created (Demo)";
}