// sample data
let items = JSON.parse(localStorage.getItem("items")) || [
    {id:1,title:"Black Backpack",claimed:false},
    {id:2,title:"AirPods Case",claimed:false},
    {id:3,title:"Calculator",claimed:false}
];

let claims = JSON.parse(localStorage.getItem("claims")) || [];

function save() {
    localStorage.setItem("items", JSON.stringify(items));
    localStorage.setItem("claims", JSON.stringify(claims));
}

const views = {
    home: document.getElementById("home"),
    file: document.getElementById("file"),
    admin: document.getElementById("admin")
};

document.querySelectorAll("[data-view]").forEach(btn=>{
    btn.onclick = e => {
        e.preventDefault();
        show(btn.dataset.view);
    };
});

function show(v){
    Object.values(views).forEach(s=>s.style.display="none");
    views[v].style.display="block";
}

function render(){
    const list = document.getElementById("itemsList");
    list.innerHTML = "";

    items.forEach(i=>{
        const div = document.createElement("div");
        div.className="item";
        div.innerHTML = `
            <div>${i.title} ${i.claimed ? "(claimed)" : ""}</div>
            <button class="btn" ${i.claimed?"disabled":""}
                onclick="claim(${i.id})">Claim</button>
        `;
        list.appendChild(div);
    });

    const select = document.getElementById("itemSelect");
    select.innerHTML="";
    items.forEach(i=>{
        const o=document.createElement("option");
        o.value=i.id;
        o.textContent=i.title;
        select.appendChild(o);
    });
}

// toggle found/lost fields
function bindClaimTypeToggle(){
    const radios = document.querySelectorAll('input[name="claimType"]');
    radios.forEach(r=> r.addEventListener('change', ()=>{
        const v = document.querySelector('input[name="claimType"]:checked').value;
        document.getElementById('foundFields').style.display = v === 'found' ? '' : 'none';
        document.getElementById('lostFields').style.display = v === 'lost' ? '' : 'none';
    }));
}

function claim(id){
    show("file");
    document.getElementById("itemSelect").value=id;
}

document.getElementById("claimForm").onsubmit = e=>{
    e.preventDefault();
    const type = document.querySelector('input[name="claimType"]:checked')?.value || 'found';
    if(type === 'found'){
        claims.push({
            type:'found',
            itemId: document.getElementById("itemSelect").value,
            name: document.getElementById("studentName").value,
            contact: document.getElementById("contact").value,
            message: document.getElementById("message").value,
            status:"pending"
        });
    } else {
        // lost report
        claims.push({
            type:'lost',
            title: document.getElementById('lostTitle').value,
            location: document.getElementById('lostLocation').value,
            dateLost: document.getElementById('lostDate').value,
            name: document.getElementById("studentName").value,
            contact: document.getElementById("contact").value,
            message: document.getElementById("message").value,
            status:"pending"
        });
    }
    save();
    alert("Claim submitted!");
    show("home");
};

document.getElementById("adminBtn").onclick = ()=>{
    const user = prompt('Admin username:');
    if(user === null) return;
    const pass = prompt('Admin password:');
    if(pass === null) return;
    if(user === 'Admin' && pass === '12345678'){
        show('admin');
        renderAdmin();
    } else {
        alert('Incorrect username or password.');
    }
};

function renderAdmin(){
    const p=document.getElementById("pendingClaims");
    p.innerHTML="<h3>Pending Claims</h3>";

    claims.forEach((c,i)=>{
        if(c.status && c.status !== 'pending') return;
        const d=document.createElement("div");
        d.className="item";
        if(c.type === 'lost'){
            d.innerHTML = `
                <div><strong>${c.name}</strong> reported <em>lost</em>: "${c.title}" <div class="muted">${c.location} · ${c.dateLost || ''}</div></div>
                <div><button class="btn" onclick="approve(${i})">Mark Found</button></div>`;
        } else {
            d.innerHTML = `
                <div><strong>${c.name}</strong> claims item #${c.itemId} <div class="muted">${c.message || ''}</div></div>
                <div><button class="btn" onclick="approve(${i})">Approve</button></div>`;
        }
        p.appendChild(d);
    });
}

function approve(i){
    if(!claims[i]) return;
    if(claims[i].type === 'found'){
        const itemId=claims[i].itemId;
        const item=items.find(x=>x.id==itemId);
        if(item) item.claimed=true;
        claims[i].status="approved";
    } else if(claims[i].type === 'lost'){
        // mark lost report as resolved/found
        claims[i].status = "resolved";
    } else {
        claims[i].status = "approved";
    }
    save();
    render();
    renderAdmin();
}

// wire up claim type toggles and cancel button
document.getElementById('cancelFile').onclick = ()=> show('home');
bindClaimTypeToggle();

render();
