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
        renderSectors();
        renderUsers();
    } else {
        errorMsg.innerText = "Usuário ou senha incorretos!";
    }
}

// 2. CONTROLE DA SIDEBAR (ABRIR / FECHAR)
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');
    const isCollapsed = sidebar.classList.contains('collapsed');
    localStorage.setItem('sidebar_collapsed', isCollapsed);
}

// 3. FUNÇÕES DOS MODAIS, ABAS E LOGOUT
function openPassModal() { document.getElementById('passwordModal').style.display = 'flex'; }
function closePassModal() {
    document.getElementById('passwordModal').style.display = 'none';
    document.getElementById('passError').innerText = '';
}

function openMachineModal() {
    document.getElementById('machineModal').style.display = 'flex';
    document.getElementById('modalTitle').innerText = "Cadastrar Nova Máquina";
    document.getElementById('btnAdd').innerText = "Adicionar Máquina";
    updateModalSectorOptions();
    updateModalUserOptions();
}

function closeMachineModal() {
    document.getElementById('machineModal').style.display = 'none';
    editIndex = null;
    if(document.getElementById('user').tagName === 'SELECT') {
        document.getElementById('user').selectedIndex = 0;
    }
    document.getElementById('os').selectedIndex = 0;
    document.getElementById('ip').value = '';
    document.getElementById('tc').value = '';
}

function openSectorModal() { document.getElementById('sectorModal').style.display = 'flex'; }
function closeSectorModal() {
    document.getElementById('sectorModal').style.display = 'none';
    document.getElementById('newSectorName').value = '';
}

function openUserModal() { document.getElementById('userModal').style.display = 'flex'; }
function closeUserModal() {
    document.getElementById('userModal').style.display = 'none';
    document.getElementById('newUserNameInput').value = '';
}

function logout() {
    sessionStorage.removeItem('isLogged');
    location.reload();
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
    
    if (tabName === 'machines') {
        document.getElementById('view-machines').style.display = 'block';
        document.getElementById('tab-machines').classList.add('active');
        renderTable();
    } else if (tabName === 'sectors') {
        document.getElementById('view-sectors').style.display = 'block';
        document.getElementById('tab-sectors').classList.add('active');
        renderSectors();
    } else if (tabName === 'users') {
        document.getElementById('view-users').style.display = 'block';
        document.getElementById('tab-users').classList.add('active');
        renderUsers();
    }
}

function updateCredentials() {
    const currentPass = document.getElementById('currentPass').value;
    const newUsername = document.getElementById('newUsername').value;
    const nextPass = document.getElementById('newPass').value;
    const confirmNext = document.getElementById('confirmNewPass').value;
    const error = document.getElementById('passError');

    if (currentPass !== adminPassword) { return error.innerText = "A senha atual está incorreta!"; }
    if (newUsername.trim() === "") { return error.innerText = "O nome de usuário não pode ser vazio!"; }
    if (nextPass !== "") {
        if (nextPass.length < 4) { return error.innerText = "Mínimo 4 caracteres na senha!"; }
        if (nextPass !== confirmNext) { return error.innerText = "As senhas não coincidem!"; }
        adminPassword = nextPass;
        localStorage.setItem('sys_password', nextPass);
    }
    adminUser = newUsername;
    localStorage.setItem('sys_username', newUsername);
    alert("Credenciais atualizadas!");
    closePassModal();
}

// 4. BANCO DE DADOS LOCAL E SINCRONIZAÇÃO
let machines = JSON.parse(localStorage.getItem('it_inventory')) || [];
let sectors = JSON.parse(localStorage.getItem('it_sectors')) || ['Faturamento', 'Almoxarifado', 'TI', 'RH'];
let appUsers = JSON.parse(localStorage.getItem('it_users')) || ['João Silva', 'Maria Santos', 'Leonardo Silva'];
let editIndex = null;

function autoSave() {
    localStorage.setItem('it_inventory', JSON.stringify(machines));
    localStorage.setItem('it_sectors', JSON.stringify(sectors));
    localStorage.setItem('it_users', JSON.stringify(appUsers));
    const status = document.getElementById('saveStatus');
    status.innerText = "💾 Salvando...";
    status.style.color = "#a7f3d0"; 
    setTimeout(() => { status.innerText = "✅ Sincronizado"; status.style.color = "#ffffff"; }, 1000);
}

// 5. GESTÃO DE SETORES
function addSector() {
    const nameInput = document.getElementById('newSectorName').value.trim();
    if (!nameInput) return alert("Digite o nome do setor.");
    
    if (sectors.some(s => s.toLowerCase() === nameInput.toLowerCase())) {
        return alert("Este setor já está cadastrado!");
    }
    
    sectors.push(nameInput);
    sectors.sort((a, b) => a.localeCompare(b, undefined, {sensitivity: 'base'}));
    
    closeSectorModal();
    renderSectors();
    autoSave();
}

function deleteSector(index) {
    const sectorName = sectors[index];
    const hasMachines = machines.some(m => m.sector === sectorName);
    
    if (hasMachines) {
        return alert(`Não é possível excluir o setor "${sectorName}" porque existem máquinas vinculadas a ele.`);
    }
    
    if (confirm(`Remover setor "${sectorName}" permanentemente?`)) {
        sectors.splice(index, 1);
        renderSectors();
        autoSave();
    }
}

function updateModalSectorOptions() {
    const select = document.getElementById('machineSector');
    select.innerHTML = '';
    sectors.forEach(s => {
        select.innerHTML += `<option value="${s}">${s}</option>`;
    });
}

function renderSectors() {
    const tbody = document.getElementById('sectorTableBody');
    tbody.innerHTML = '';
    
    sectors.forEach((s, index) => {
        const sectorColor = stringToColor(s);
        tbody.innerHTML += `
            <tr>
                <td><strong class="user-name">${s}</strong></td>
                <td><span class="badge-sector" style="background-color: ${sectorColor}">${s}</span></td>
                <td style="text-align: right; padding-right: 25px;">
                    <button class="btn-delete" style="padding: 6px 12px; font-size: 12px;" onclick="deleteSector(${index})">Excluir</button>
                </td>
            </tr>`;
    });
}

// 6. GESTÃO DE USUÁRIOS
function addUser() {
    const nameInput = document.getElementById('newUserNameInput').value.trim();
    if (!nameInput) return alert("Digite o nome do colaborador.");
    
    if (appUsers.some(u => u.toLowerCase() === nameInput.toLowerCase())) {
        return alert("Este usuário já está cadastrado!");
    }
    
    appUsers.push(nameInput);
    appUsers.sort((a, b) => a.localeCompare(b, undefined, {sensitivity: 'base'}));
    
    closeUserModal();
    renderUsers();
    autoSave();
}

function deleteUser(index) {
    const userName = appUsers[index];
    const hasMachines = machines.some(m => m.user === userName);
    
    if (hasMachines) {
        return alert(`Não é possível excluir o usuário "${userName}" porque existem máquinas vinculadas a ele.`);
    }
    
    if (confirm(`Remover colaborador "${userName}" permanentemente?`)) {
        appUsers.splice(index, 1);
        renderUsers();
        autoSave();
    }
}

function renderUsers() {
    const tbody = document.getElementById('userTableBody');
    tbody.innerHTML = '';
    
    appUsers.forEach((u, index) => {
        tbody.innerHTML += `
            <tr>
                <td><strong class="user-name">${u}</strong></td>
                <td style="text-align: right; padding-right: 25px;">
                    <button class="btn-delete" style="padding: 6px 12px; font-size: 12px;" onclick="deleteUser(${index})">Excluir</button>
                </td>
            </tr>`;
    });
}

function updateModalUserOptions() {
    const select = document.getElementById('user');
    if (select.tagName === 'SELECT') {
        select.innerHTML = '';
        appUsers.forEach(u => {
            select.innerHTML += `<option value="${u}">${u}</option>`;
        });
    }
}

// 7. GESTÃO DE MÁQUINAS
function addMachine() {
    const data = {
        user: document.getElementById('user').value,
        os: document.getElementById('os').value,
        sector: document.getElementById('machineSector').value,
        ip: document.getElementById('ip').value.trim(),
        tc: document.getElementById('tc').value.trim()
    };

    if(!data.user) return alert("Preencha o campo Usuário.");

    if(editIndex !== null) {
        machines[editIndex] = data;
        editIndex = null;
    } else {
        machines.push(data);
    }

    closeMachineModal();
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
    openMachineModal();
    
    document.getElementById('modalTitle').innerText = "Editar Especificações";
    document.getElementById('user').value = m.user;
    document.getElementById('os').value = m.os;
    document.getElementById('machineSector').value = m.sector;
    document.getElementById('ip').value = m.ip;
    document.getElementById('tc').value = m.tc;
    
    editIndex = index;
    document.getElementById('btnAdd').innerText = "Atualizar Máquina";
}

// 8. AUXILIARES E CORES
function stringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    let color = '#';
    for (let i = 0; i < 3; i++) {
        let value = (hash >> (i * 8)) & 0xFF;
        value = Math.floor((value + 160) / 2); 
        color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
}

function updateFilterOptions() {
    const select = document.getElementById('filterSector');
    const currentFilter = select.value;
    select.innerHTML = '<option value="all">Todos os setores</option>';
    
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
                <td><span class="user-name">${m.user}</span></td>
                <td><span class="text-secondary">${m.os}</span></td>
                <td><span class="badge-sector" style="background-color: ${sectorColor}">${m.sector}</span></td>
                <td><code>${m.ip || '—'}</code></td>
                <td><span class="text-secondary">${m.tc || '—'}</span></td>
                <td style="text-align: right; padding-right: 25px;">
                    <button class="btn-edit" style="padding: 6px 12px; font-size: 12px; margin-right: 5px;" onclick="editMachine(${index})">Editar</button>
                    <button class="btn-delete" style="padding: 6px 12px; font-size: 12px;" onclick="deleteMachine(${index})">Excluir</button>
                </td>
            </tr>`;
    });
    updateFilterOptions();
}

window.onload = () => {
    if(sessionStorage.getItem('isLogged') === 'true') {
        document.getElementById('loginScreen').style.display = "none";
    }
    if(localStorage.getItem('sidebar_collapsed') === 'true') {
        document.getElementById('sidebar').classList.add('collapsed');
    }
    
    renderTable();
    renderSectors();
    renderUsers();

    // Eventos de teclado para Enter
    document.querySelector('#loginScreen .login-box').addEventListener('keydown', (e) => { if (e.key === 'Enter') handleLogin(); });
    document.querySelector('#machineModal .machine-box').addEventListener('keydown', (e) => { if (e.key === 'Enter') addMachine(); });
    document.querySelector('#passwordModal .login-box').addEventListener('keydown', (e) => { if (e.key === 'Enter') updateCredentials(); });
    document.querySelector('#sectorModal .login-box').addEventListener('keydown', (e) => { if (e.key === 'Enter') addSector(); });
    document.querySelector('#userModal .login-box').addEventListener('keydown', (e) => { if (e.key === 'Enter') addUser(); });
};
