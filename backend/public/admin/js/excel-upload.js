function uploadExcel()
{
  const fileInput = document.getElementById("excelFile");
  const msg = document.getElementById("msg");

  if (!fileInput.files.length)
  {
    msg.style.color = "red";
    msg.innerText = "❌ Please select an Excel file";
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = function (e)
  {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json(sheet);

    if (rows.length === 0)
    {
      msg.style.color = "red";
      msg.innerText = "❌ Excel is empty";
      return;
    }

const voters = rows.map(row => (
{
  name: row["Name"],
  age: row["Age"],
  gender: row["Gender"],
  address: row["Address"],
  mobile: String(row["Mobile"]),
  area: row["Area"],
  support: "Neutral"
}));


fetch("/api/voters/upload-excel",
{
  method: "POST",
  headers:
  {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + localStorage.getItem("admin_token")
  },
  body: JSON.stringify({ voters })
})
.then(res => res.json())
.then(data => {
  msg.style.color = "green";
  msg.innerText = data.message;
})
.catch(() =>
{
  msg.style.color = "red";
  msg.innerText = "❌ Server error";
});
};

  reader.readAsArrayBuffer(file);
}