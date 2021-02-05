const theme =
{
    html: document.querySelector('html'),
    switch: document.querySelector('#switch'),
    
    dark()
    {
        this.html.classList.toggle('dark-mode')
    },
}
const Modal = 
{
    open()
    {
        // Abrir Modal
        // Add class active ao modal
        document.querySelector(".modal-overlay").classList.add('active')
    },
    close()
    {
        //fechar o modal
        //remover a class active do modal
        document.querySelector(".modal-overlay").classList.remove('active')
    }
}
const Storage = 
{
    get(){
        // Transformando JSON string para um aray
        return JSON.parse(localStorage.getItem('dev.finances:transactions')) || []
    },
    set(transactions){
        localStorage.setItem('dev.finances:transactions', JSON.stringify(transactions))
    },
}

const Transaction = 
{
    all: Storage.get(),
    incomes()
    {
        let income = 0
        this.all.forEach(transaction =>{
            if(transaction.amount > 0)
            {
                income += transaction.amount
            }
        })
        return income
    },
    expenses()
    {
        //somar as saídas
        let expense = 0
        this.all.forEach(transaction =>{
            if(transaction.amount < 0)
            {
                expense += transaction.amount
            }
        })
        return expense
    },
    total()
    {
        // incomes + expenses
        let total = this.incomes() - this.expenses()
        return total
    },
    add(info)
    {
        Transaction.all.push(info)
        App.reload()
    },
    remove(index)
    {        
        this.all.splice(index,1) // splice recebe o indice do array e remove a partir desse indice quantos elementos vc quantificar
        App.reload()
    },
}
const DOM = 
{
    transactionContainer: document.querySelector('#data-table tbody'),
    addTransaction(transaction, index)
    {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction,index)
        tr.dataset.index = index
        
        DOM.transactionContainer.appendChild(tr)
    },
    innerHTMLTransaction(transaction, index)
    {
        const cssClass = transaction.amount < 0 ? "expense" : "income"
        const amount = Utils.formatCurrency(transaction.amount)
        const html = 
        `
            <td class="description">${transaction.description}</td>
            <td class="${cssClass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover Transação">
            </td>
        `

        return html
    },
    updateBalance()
    {
        document.querySelector('#incomesDisplay')
        .innerHTML =  Utils.formatCurrency(Transaction.incomes())         
        document.querySelector('#expensesDisplay')
        .innerHTML = Utils.formatCurrency(Transaction.expenses())         
        document.querySelector('#totalDisplay')
        .innerHTML = Utils.formatCurrency(Transaction.total())        
    },
    clearAll()
    {
        this.transactionContainer.innerHTML = ""
    }
}
const Utils = 
{
    formatAmount(value)
    {
        value = Number(value.replace(/\,\./g, "")) * 100
        console.log(value)
        return value
    },
    formatDate(date)
    {
        const splittedDate = date.split('-')
        console.log(`${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`)

        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },
    formatCurrency(value) 
    {
        const signal = Number(value) < 0 ? '-' : ''

        value = String(value).replace(/\D/g, "") /** /\D/g(global)Procura tudo que não for número na Sting */

        value = Number(value)/100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        })
        return signal + value
    }
} 
const Form = 
{
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),
    getValue()
    {
        return {
            description: this.description.value, 
            amount: this.amount.value, 
            date: this.date.value, 
        }
    },
    //Verificar os Campos
    validateFields(){
        const {description, amount, date} = Form.getValue()

        if  (
            description.trim() === '' ||
            amount.trim() === '' ||
            date.trim() === '' 
            )
            {
                // trim( verifica espaos vazios)
                throw new Error('Por favor, preencha todos os campos')
            }
    },
    // Formatar os Dados
    formatData(){
        let {description, amount, date} = Form.getValue()
        amount = Utils.formatAmount(amount)
        
        date = Utils.formatDate(date)
        
        return {
            description,
            amount,
            date,
        }
    },
    saveTransaction(transaction)
    {
        Transaction.add(transaction)
    },
    clearFields()
    {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },
    submit(event){
        event.preventDefault()

        try {
            // Validar os Campos
            Form.validateFields()
            // Formatar os dados
            const transaction = Form.formatData()
            // Salvar
            Form.saveTransaction(transaction)
            // Apagar os dados do formulário  
            Form.clearFields()
            // Fechar Modal
            Modal.close()
        } catch (error){
            alert(error.message)
        }

    },
}
const App = 
{
    init()
    {
        Transaction.all.forEach(transaction => {

            DOM.addTransaction(transaction)


        })
        DOM.updateBalance()
        Storage.set(Transaction.all)
    },
    reload()
    {
        DOM.clearAll()
        this.init()

    }
}
App.init()

