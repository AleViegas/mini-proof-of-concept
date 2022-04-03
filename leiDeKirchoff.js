import readline from "readline"
import util from "util"

function sleep(ms) {
  // função para dar delay nos console.log
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  })
}

function resolveCircuit(circuit){
  // função que resolve todos os calculos
  // recebe o circuito em objeto
  // devolve todas as tensões por ramos dentro de um array de objetos

  // tensão gerada = tensão consumida
  
  const currents = []
  // array que sera retornado 

  circuit.resistences.forEach(resistence => {
      const { omns, branche } = resistence

      let receptorVoltage = 0
      
      if (circuit.receptors[0] != null) {
          const receptor = circuit.receptors.find(receptor => receptor.branche == branche)
          if (receptor) {receptorVoltage = receptor.voltage}
      }
      
      const maxVoltage = circuit.generatorVoltage - receptorVoltage
      const current = maxVoltage/omns

      currents.push({branche, current})
  });
  
  let sumAllCurrents = currents.reduce((prev, actual) => {
    let sum = prev.current + actual.current
    return {current: sum} 
  })
  
  if (typeof sumAllCurrents === "object") {
    sumAllCurrents = sumAllCurrents.current
  }

  circuit.receptors.forEach(receptor => {
    const { voltage, branche } = receptor

    const resistence = circuit.resistences.find(resistence => resistence.branche == branche)
    if (!resistence) {
      currents.forEach(component => component.current = 0)
      currents.push({branche, current: sumAllCurrents})
    } 

  })
  
  const totalCurrent = {branche: 0, current:sumAllCurrents}

  currents.unshift(totalCurrent)

  return currents
}


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  // instância do terminal interativo
  // é uma stream - tty

  const question = util.promisify(rl.question).bind(rl);
  // função que copia rl.question (metodo que pega o input do usuario) e transforma ele em assincrono


function addComponent(circuit, userInput, branche, component) {
  // função para adicionar o input do usuario no circuito

  if (component == 0) {
    // resistencia
    circuit.resistences.push({omns: userInput, branche})
  }
  if (component == 1) {
    // receptor
    circuit.receptors.push({voltage: userInput, branche})
  }
}

async function main() {

  let run = true
  // variavel para fechar o programa
  let branche = 1
  // variavel para controlar os ramos do circuito

  const art = 
`
+ - - - - + - - N - - +
|         |           |
|         R           |
G         |           C
|         C           |
|         |           |
+ - - - - + - - N - - +
`
  
  console.log("Bem vindo ao kirchhof")
  await sleep(500)
  console.log("Aqui vamos resolver problemas de circuitos eletricos que sigam esse padrão")
  await sleep(1000)
  console.log(art)
  await sleep(1000)
  console.log("G - Gerador | R - Primeira resistencia | C - Resistor ou receptor | N - Quantidade de ramos em paralelo")
  await sleep(2000)

  
  const inputedGeneratorVoltage = await question("Comece dando a tensão do gerador:\n");  
  await sleep(500)
  const inputedFirstResistence = await question("Agora o valor em omns do primeiro resistor:\n");
  await sleep(500)
  // inputs do usuario

  let circuit = {generatorVoltage:Number(inputedGeneratorVoltage), resistences:[{omns: Number(inputedFirstResistence), branche}], receptors:[]}
  
  let choice
  let lastChoice

  while (run == true) {
    // loop para adição de novos componentes e ramos

    choice = await question(`o que voce deseja adicionar?\n[1] resistor\n[2] receptor\n[3] um proximo ramo em paralelo\n[4] nada e fechar o circuito\n`);
    await sleep(500)
    
    if (choice == "1") {
      const inputedResistor = await question("Qual a resistecia dele?\n");
      addComponent(circuit, Number(inputedResistor), branche, 0)
    } 
    
    if (choice == "2") {
      const inputedReceptor = await question("Qual a tensão dele?\n");
      addComponent(circuit, Number(inputedReceptor), branche, 1)
    } 
    
    if (choice == "3") {
      branche++
    } 
    
    if (choice == "3" && lastChoice == "3") {
      branche--
      console.log("aa")
    }
    
    if (choice == "4"){
      run = false
      return circuit
    }
    
    lastChoice = choice
    await sleep(500)
    
  }  
}

const data = await main()
// execução e retorno da função main

console.log("\n",resolveCircuit(data))
// console.log do resultado 

rl.close()
// fechamento do terminal



// to-do
// tratamento dos inputs
// resolução final em texto

