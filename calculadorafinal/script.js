let fullOp = '';
let historial = [];
let isResult = false; // sirve para saber si lo que hay en pantalla es un resultado final
const operators = ['+', '-', '*', '/', '^'];

const screen = () => document.getElementById('screen');
const operacion = () => document.getElementById('operacion');

const toDisplay = (str) => str.replace(/\*/g, '×').replace(/\//g, '÷');

const handleClick = (value) => {
    // si hay un resultado y el usuario presiona algo limpia para empezar again
    if (isResult && !operators.includes(value)) {
        fullOp = '';
        isResult = false;
    } else if (isResult && operators.includes(value)) {
        // si hay un resultado pero presiona un operador permite seguir operando con el resultado anterior
        isResult = false;
    }

    if (value === 'ac') {
        fullOp = '';
        screen().textContent = '0';
        operacion().textContent = '';
        return;
    }

    if (value === 'del') {
        if (fullOp === '') return;
        fullOp = fullOp.slice(0, -1);
        screen().textContent = fullOp === '' ? '0' : toDisplay(fullOp);
        return;
    }

    if (operators.includes(value)) {
        // signo negativo al inicio
        if (fullOp === '' && value === '-') {
            fullOp = '-';
            screen().textContent = '-';
            return;
        }
        
        // no permite otros operadores si esta vacio o solo hay un -
        if (fullOp === '' || fullOp === '-') return;

        // reemplaza operador si se presiona uno nuevo consecutivamente
        if (operators.includes(fullOp[fullOp.length - 1])) {
            fullOp = fullOp.slice(0, -1) + value;
            screen().textContent = toDisplay(fullOp);
            return;
        }
    }

    if (value === '.') {
        const parts = fullOp.split(/[+\-*\/^]/);
        const currentNum = parts[parts.length - 1];
        if (currentNum.includes('.')) return;
        if (currentNum === '' || currentNum === '-') value = '0.';
    }

    fullOp += value;
    operacion().textContent = '';
    screen().textContent = toDisplay(fullOp);
}

const calculate = () => {
    // evita calcular si esta vacío o termina en operador
    if (fullOp === '' || operators.includes(fullOp.slice(-1))) return;

    try {
        // reemplazo de potencia con jerarquia correcta usando ** para que funcione con eval
        const expression = fullOp.replace(/\^/g, '**');
        
        // evalua la expresion respetando jerarquia de operaciones
        let res = new Function(`return ${expression}`)();

        if (typeof res === 'number') {
            res = Number(res.toPrecision(12)) / 1; // limita a 12 digitos significativos para evitar problemas con decimales largos
        }

        const displayExpr = toDisplay(fullOp);
        
        // actualiza UI
        operacion().textContent = displayExpr + ' =';
        screen().textContent = res;

        // guarda en Historial
        historial.push({ op: displayExpr, res });
        renderHistorial();
        
        // prepara para la siguiente acción
        fullOp = String(res);
        isResult = true; 
    } catch (e) {
        screen().textContent = 'Error';
        fullOp = '';
    }
}

const renderHistorial = () => {
    const list = document.getElementById('historial-list');
    list.innerHTML = '';

    if (historial.length === 0) {
        list.innerHTML = '<p class="historial-empty">Sin cálculos aún.</p>';
        return;
    }

    historial.slice().reverse().forEach(item => {
        const card = document.createElement('div');
        card.className = 'historial-item';
        
        card.onclick = () => {
            fullOp = String(item.res);
            screen().textContent = item.res;
            operacion().textContent = '';
            isResult = true;
        };

        card.innerHTML = `
            <div class="op">${item.op}</div>
            <div class="res-container">
                <span class="res">${item.res}</span>
            </div>
        `;
        
        list.appendChild(card);
    });
}

const clearHistorial = () => {
    historial = [];
    renderHistorial();
}