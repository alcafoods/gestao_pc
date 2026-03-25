// 1. CREDENCIAIS E LOGIN
let adminUser = localStorage.getItem('sys_username') || 'Leonardo';
let adminPassword = localStorage.getItem('sys_password') || 'Leo#2025';

function handleLogin() {
    const userInput = document.getElementById('loginUser').value;
    const passInput = document.getElementById('loginPass').value;
    const errorMsg = document.getElementById('loginError');

    if (userInput === adminUser && passInput === adminPassword) {
        document.getElementById('loginScreen').style.display = "none"; 
        sessionStorage.setItem('isLogged', 'true');
        renderTable(); 
    } else {
        errorMsg.innerText = "Usuário ou senha incorretos!";
    }
}

// 2. FUNÇÕES DOS MODAIS E LOGOUT (O que estava faltando)
function openPassModal() {
    document.getElementById('passwordModal').style.display = 'flex';
}

function closePassModal() {
    document.getElementById('passwordModal').style.display = 'none';
    document.getElementById('passError').innerText = '';
}

function logout() {
    sessionStorage.removeItem('isLogged');
    location.reload();
}

function updateCredentials() {
    const currentPass = document.getElementById('currentPass').value;
    const newUsername = document.getElementById('newUsername').value;
    const nextPass = document.getElementById('newPass').value;
    const confirmNext = document.getElementById('confirmNewPass').value;
    const error = document.getElementById('passError');

    if (currentPass !== adminPassword) {
        error.innerText = "A senha atual está incorreta!";
        return;
    }
    if (newUsername.trim() === "") {
        error.innerText = "O nome de usuário não pode ser vazio!";
        return;
    }
    if (nextPass !== "") {
        if (nextPass.length < 4) {
            error.innerText = "Mínimo 4 caracteres na senha!";
            return;
        }
        if (nextPass !== confirmNext) {
            error.innerText = "As senhas não coincidem!";
            return;
        }
        adminPassword = nextPass;
        localStorage.setItem('sys_password', nextPass);
    }

    adminUser = newUsername;
    localStorage.setItem('sys_username', newUsername);
    alert("Credenciais atualizadas!");
    closePassModal();
}

// 3. GESTÃO DE MÁQUINAS
let machines = JSON.parse(localStorage.getItem('it_inventory')) || [];
let editIndex = null;

function autoSave() {
    localStorage.setItem('it_inventory', JSON.stringify(machines));
    const status = document.getElementById('saveStatus');
    status.innerText = "💾 Salvando...";
    status.style.color = "#16a34a"; // Força a cor verde para aparecer no fundo branco
    setTimeout(() => {
        status.innerText = "✅ Sincronizado";
    }, 1000);
}

function addMachine() {
    const data = {
        user: document.getElementById('user').value,
        os: document.getElementById('os').value,
        sector: document.getElementById('sector').value,
        ip: document.getElementById('ip').value,
        tc: document.getElementById('tc').value
    };

    if(!data.user || !data.sector) return alert("Preencha Usuário e Setor.");

    if(editIndex !== null) {
        machines[editIndex] = data;
        editIndex = null;
        document.getElementById('btnAdd').innerText = "Adicionar Máquina";
    } else {
        machines.push(data);
    }

    document.querySelectorAll('.controls input').forEach(i => i.value = '');
    renderTable();
    autoSave();
}

function deleteMachine(index) {
    if(confirm("Remover máquina?")) {
        machines.splice(index, 1);
        renderTable();
        autoSave();
    }
}

function editMachine(index) {
    const m = machines[index];
    document.getElementById('user').value = m.user;
    document.getElementById('os').value = m.os;
    document.getElementById('sector').value = m.sector;
    document.getElementById('ip').value = m.ip;
    document.getElementById('tc').value = m.tc;
    editIndex = index;
    document.getElementById('btnAdd').innerText = "Atualizar Máquina";
}

// 4. CORES E RENDERIZAÇÃO
function stringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    let color = '#';
    for (let i = 0; i < 3; i++) {
        let value = (hash >> (i * 8)) & 0xFF;
        color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
}

function updateFilterOptions() {
    const select = document.getElementById('filterSector');
    const currentFilter = select.value;
    
    // Pegamos os setores, removemos duplicados e aplicamos o SORT para ordem alfabética
    const sectors = [...new Set(machines.map(m => m.sector))].sort((a, b) => {
        return a.localeCompare(b, undefined, {sensitivity: 'base'});
    });
    
    select.innerHTML = '<option value="all">Todos</option>';
    
    sectors.forEach(s => {
        const selected = (s === currentFilter) ? 'selected' : '';
        select.innerHTML += `<option value="${s}" ${selected}>${s}</option>`;
    });
}

function renderTable() {
    const tbody = document.getElementById('tableBody');
    const filter = document.getElementById('filterSector').value;
    tbody.innerHTML = '';

    machines.forEach((m, index) => {
        if(filter !== 'all' && m.sector !== filter) return;
        const sectorColor = stringToColor(m.sector);

        tbody.innerHTML += `
            <tr>
                <td><strong>${m.user}</strong></td>
                <td>${m.os}</td>
                <td><span class="badge-sector" style="background-color: ${sectorColor}">${m.sector}</span></td>
                <td><code>${m.ip}</code></td>
                <td>${m.tc}</td>
                <td>
                    <button class="btn-edit" onclick="editMachine(${index})">Editar</button>
                    <button class="btn-delete" onclick="deleteMachine(${index})">Excluir</button>
                </td>
            </tr>`;
    });
    updateFilterOptions();
}

// Verifica sessão ao carregar
window.onload = () => {
    if(sessionStorage.getItem('isLogged') === 'true') {
        document.getElementById('loginScreen').style.display = "none";
    }
    renderTable();
};