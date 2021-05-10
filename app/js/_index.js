'use strict';

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2]

const labelWelcome = document.querySelector('.welcome')
const labelDate = document.querySelector('.date')
const labelBalance = document.querySelector('.balance__value')
const labelSumIn = document.querySelector('.summary__value--in')
const labelSumOut = document.querySelector('.summary__value--out')
const labelSumInterest = document.querySelector('.summary__value--interest')
const labelTimer = document.querySelector('.timer')

const containerApp = document.querySelector('.app')
const containerMovements = document.querySelector('.movements')

const btnLogin = document.querySelector('.login__btn')
const btnTransfer = document.querySelector('.form__btn--transfer')
const btnLoan = document.querySelector('.form__btn--loan')
const btnClose = document.querySelector('.form__btn--close')
const btnSort = document.querySelector('.btn--sort')

const inputLoginUsername = document.querySelector('.login__input--user')
const inputLoginPin = document.querySelector('.login__input--pin')
const inputTransferTo = document.querySelector('.form__input--to')
const inputTransferAmount = document.querySelector('.form__input--amount')
const inputLoanAmount = document.querySelector('.form__input--loan-amount')
const inputCloseUsername = document.querySelector('.form__input--user')
const inputClosePin = document.querySelector('.form__input--pin')

let currentUser = account1;

const createUserNames = (accounts) => {
  accounts.forEach(acc => {
    acc.userName = acc
      .owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('')
  })
}
createUserNames(accounts)

const displayMovements = (movements, sort = false) => {
  containerMovements.innerHTML = ''

  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements

  movs.forEach((mov, i) => {
    const type = mov > 0 ? 'deposit' : 'withdrawal'

    const html = `<div class="movements__row">
      <div class="movements__type movements__type--${type}">
        ${i} ${type}
      </div>
      <div class="movements__value">${mov.toFixed(2)}</div>
    </div>`

    containerMovements.insertAdjacentHTML('afterbegin', html)
  })

}

const calcCurrentBalance = () => {
  currentUser.balance = currentUser.movements.reduce((accum, mov) => accum + mov)
  labelBalance.textContent = `${currentUser.balance.toFixed(2)}€`
}

const calcSummary = () => {
  const income = currentUser.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov)
  labelSumIn.textContent = `${income.toFixed(2)}€`

  const out = currentUser.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov)
  labelSumOut.textContent = `${out.toFixed(2)}€`

  const interest = currentUser.movements
    .filter(mov => mov > 0)
    .map(mov => mov * currentUser.interestRate / 100)
    .filter(deposit => deposit >= 1)
    .reduce((acc, dep) => acc + dep)
  labelSumInterest.textContent = `${interest.toFixed(2)}€`
}

const updateUI = () => {
  displayMovements(currentUser.movements)
  calcCurrentBalance()
  calcSummary()
}

//event handlers
btnLogin.addEventListener('click', function(e) {
  e.preventDefault()

  currentUser = accounts.find(acc => acc.userName === inputLoginUsername.value)
  if (!currentUser || currentUser.pin !== Number(inputLoginPin.value) ) {
    inputLoginPin.value = inputLoginUsername.value = ''
    console.log('Wrong user name or password')
    return
  }

  labelWelcome.textContent = `Welcome, ${currentUser.owner.split(' ')[0]}`
  containerApp.style.opacity = 1

  inputLoginPin.value = inputLoginUsername.value = ''

  updateUI()
})

btnTransfer.addEventListener('click', (e) => {
  e.preventDefault()

  const transferAmount = Number(inputTransferAmount.value)
  const transferAccount = accounts.find(acc => acc.userName === inputTransferTo.value)

  if (!transferAccount
    || !transferAmount
    || transferAmount < 0
    || transferAccount.userName === currentUser.userName
    || currentUser.balance < transferAmount
  ) {
    console.log('Wrong transfer-to user name or amount or not enough balance')
    inputTransferTo.value = inputTransferAmount.value = ''
    return
  }

  currentUser.movements.push(-transferAmount)
  transferAccount.movements.push(transferAmount)

  inputTransferTo.value = inputTransferAmount.value = ''
  updateUI()
})

btnLoan.addEventListener('click', (e) => {
  e.preventDefault()

  const amount = Number(inputLoanAmount.value)
  inputLoanAmount.value = ''

  if (amount <= 0 || !currentUser.movements.some(mov => mov >= amount * 0.1)){
    console.log('Can not get loan')
    return
  }

  currentUser.movements.push(amount)

  updateUI()
})

btnClose.addEventListener('click', (e) => {
  e.preventDefault()

  if (currentUser.userName !== inputCloseUsername.value || currentUser.pin !== Number(inputClosePin.value)) {
    console.log('Account can not be closed. Wrong user name or password')
    inputCloseUsername.value = inputClosePin.value = ''
    return
  }

  const index = accounts.findIndex(acc => acc.userName === currentUser.userName)

  accounts.splice(index, 1)

  containerApp.style.opacity = 0

  inputCloseUsername.value = inputClosePin.value = ''
})

let sorted = false

btnSort.addEventListener('click', e => {
  e.preventDefault()

  displayMovements(currentUser.movements, !sorted)
  sorted = !sorted
})

updateUI()
