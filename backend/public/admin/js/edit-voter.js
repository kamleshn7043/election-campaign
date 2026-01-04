const params = new URLSearchParams(window.location.search);
const voterId = params.get("id");

// load voter data
fetch(`/api/voters/${voterId}`,
{
  headers:
  {
    Authorization: "Bearer " + localStorage.getItem("token")
  }
})
.then(res => res.json())
.then(v =>
{
  name.value = v.name;
  age.value = v.age;
  gender.value = v.gender;
  address.value = v.address;
  mobile.value = v.mobile;
  area.value = v.area;
  support.value = v.support;
});

function updateVoter()
{
  fetch(`/api/voters/update/${voterId}`,
  {
    method: "PUT",
    headers:
    {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token")
    },
    body: JSON.stringify(
    {
      name: name.value,
      age: age.value,
      gender: gender.value,
      address: address.value,
      mobile: mobile.value,
      area: area.value,
      support: support.value
    })
  })
  .then(res => res.json())
  .then(d =>
  {
    msg.innerText = d.message;
    msg.style.color = "green";
  });
}