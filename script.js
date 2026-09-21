// --- SEED INITIAL DATABASE RECORDS ---
const initialDonors = [
  { id: 101, name: "Sahil Kumar", age: "20", gender: "Male", bloodGroup: "O+", phone: "+91 9876543210", email: "sahil@example.com", city: "Bhagalpur", status: "Available" },
  { id: 102, name: "Ankit Sharma", age: "24", gender: "Male", bloodGroup: "B+", phone: "+91 9812345678", email: "ankit@example.com", city: "Patna", status: "Available" }
];

const initialRequests = [
  { id: 1, patientName: "Ramesh Singh", bloodGroup: "B-", units: 2, hospital: "Sadar Hospital", city: "Bhagalpur", contactPerson: "Priya Singh", contactPhone: "+91 9123456789", urgency: "High (Within 6 hours)" }
];

// Initialize Local Storage
if (!localStorage.getItem("donorDatabase")) {
  localStorage.setItem("donorDatabase", JSON.stringify(initialDonors));
}
if (!localStorage.getItem("bloodRequests")) {
  localStorage.setItem("bloodRequests", JSON.stringify(initialRequests));
}

// Master DOMContentLoaded Event
document.addEventListener("DOMContentLoaded", () => {
  
  // =========================================
  // 1. DASHBOARD PAGE LOGIC
  // =========================================
  const factTextElement = document.getElementById("fact-text");
  const nextFactBtn = document.getElementById("next-fact-btn");

  if (factTextElement && nextFactBtn) {
    const FACT_API_URL = "https://uselessfacts.jsph.pl/api/v2/facts/random";
    const localBloodFacts = [
      "One single donation of blood can save up to three lives!",
      "AB Positive is the universal recipient group.",
      "O Negative is the universal red cell donor type.",
      "An average adult body contains about 5 liters of blood."
    ];

    function fetchRandomFact() {
      for (fact of localBloodFacts){
        const randomIndex = Math.floor(Math.random() * localBloodFacts.length);
        factTextElement.innerText = localBloodFacts[randomIndex]
        }
    }

    fetchRandomFact();
    nextFactBtn.addEventListener("click", fetchRandomFact);

    // Update Dashboard donor count stat dynamically
    const statDonors = document.getElementById("stat-donors");
    if (statDonors) {
      const donors = JSON.parse(localStorage.getItem("donorDatabase")) || [];
      statDonors.textContent = donors.length;
    }
  }

  // =========================================
  // 2. DONOR REGISTRATION LOGIC
  // =========================================
  const donorForm = document.getElementById("donorForm");
  if (donorForm) {
    donorForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const newDonor = {
        id: Date.now(),
        name: document.getElementById("fullName").value.trim(),
        age: document.getElementById("age").value,
        gender: document.getElementById("gender").value,
        bloodGroup: document.getElementById("bloodGroup").value,
        phone: document.getElementById("phone").value.trim(),
        email: document.getElementById("email").value.trim() || "N/A",
        city: document.getElementById("city").value.trim(),
        status: document.getElementById("availability").value
      };

      const existingDonors = JSON.parse(localStorage.getItem("donorDatabase")) || [];
      existingDonors.unshift(newDonor);
      localStorage.setItem("donorDatabase", JSON.stringify(existingDonors));

      const successAlert = document.getElementById("success-alert");
      if (successAlert) successAlert.style.display = "flex";
      donorForm.reset();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // =========================================
  // 3. ASK FOR BLOOD LOGIC
  // =========================================
  const requestForm = document.getElementById("requestForm");
  const requestsContainer = document.getElementById("requestsContainer");

  if (requestsContainer) {
    function renderRequests() {
      const requests = JSON.parse(localStorage.getItem("bloodRequests")) || [];
      requestsContainer.innerHTML = "";

      if (requests.length === 0) {
        requestsContainer.innerHTML = "<p style='text-align:center;'>No emergency requests found.</p>";
        return;
      }

      requests.forEach(req => {
        const card = document.createElement("div");
        card.className = "card";
        card.style.background = "var(--primary-light)";
        card.innerHTML = `
          <div style="display:flex; justify-between; align-items:center;">
            <span class="badge-blood">Need ${req.bloodGroup}</span>
            <small style="color:var(--primary-dark); font-weight:bold;">${req.urgency}</small>
          </div>
          <p style="margin-top:0.5rem;"><strong>Patient:</strong> ${req.patientName} (${req.units} Units)</p>
          <p><strong>Hospital:</strong> ${req.hospital}, ${req.city}</p>
          <p><strong>Contact:</strong> ${req.contactPerson} (${req.contactPhone})</p>
        `;
        requestsContainer.appendChild(card);
      });
    }

    renderRequests();

    if (requestForm) {
      requestForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const newRequest = {
          id: Date.now(),
          patientName: document.getElementById("patientName").value.trim(),
          bloodGroup: document.getElementById("bloodGroup").value,
          units: document.getElementById("units").value,
          urgency: document.getElementById("urgency").value,
          hospital: document.getElementById("hospital").value.trim(),
          city: document.getElementById("city").value.trim(),
          contactPerson: document.getElementById("contactPerson").value.trim(),
          contactPhone: document.getElementById("contactPhone").value.trim()
        };

        const requests = JSON.parse(localStorage.getItem("bloodRequests")) || [];
        requests.unshift(newRequest);
        localStorage.setItem("bloodRequests", JSON.stringify(requests));
        renderRequests();
        requestForm.reset();
      });
    }
  }

  // =========================================
  // 4. DONOR DATABASE LOGIC
  // =========================================
  const tableBody = document.getElementById("donorTableBody");
  if (tableBody) {
    const searchInput = document.getElementById("searchInput");
    const filterBloodGroup = document.getElementById("filterBloodGroup");
    const filterStatus = document.getElementById("filterStatus");

    let donors = JSON.parse(localStorage.getItem("donorDatabase")) || [];

    function renderTable(data) {
      tableBody.innerHTML = "";
      data.forEach((donor) => {
        const isAvailable = donor.status === "Available";
        const row = document.createElement("tr");
        row.innerHTML = `
          <td><strong>${donor.name}</strong></td>
          <td>${donor.age} yrs / ${donor.gender}</td>
          <td><span class="badge-blood">${donor.bloodGroup}</span></td>
          <td>${donor.city}</td>
          <td>${donor.phone}</td>
          <td>
            <span class="badge-status ${isAvailable ? 'status-available' : 'status-unavailable'}">
              ${donor.status}
            </span>
          </td>
          <td>
            <button onclick="deleteDonor(${donor.id})" style="color:var(--primary); background:none; border:none; cursor:pointer;">Delete</button>
          </td>
        `;
        tableBody.appendChild(row);
      });
    }

    function filterDonors() {
      const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
      const selectedGroup = filterBloodGroup ? filterBloodGroup.value : "";
      const selectedStatus = filterStatus ? filterStatus.value : "";

      const filtered = donors.filter((donor) => {
        const matchesSearch = donor.name.toLowerCase().includes(query) || donor.city.toLowerCase().includes(query);
        const matchesGroup = selectedGroup === "" || donor.bloodGroup === selectedGroup;
        const matchesStatus = selectedStatus === "" || donor.status === selectedStatus;
        return matchesSearch && matchesGroup && matchesStatus;
      });

      renderTable(filtered);
    }

    window.deleteDonor = function(id) {
      donors = donors.filter(d => d.id !== id);
      localStorage.setItem("donorDatabase", JSON.stringify(donors));
      filterDonors();
    };

    if (searchInput) searchInput.addEventListener("input", filterDonors);
    if (filterBloodGroup) filterBloodGroup.addEventListener("change", filterDonors);
    if (filterStatus) filterStatus.addEventListener("change", filterDonors);

    renderTable(donors);
  }
});
