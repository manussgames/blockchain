const SHA256 = require("crypto-js/sha256");
const readline = require("readline");
const rl = readline.createInterface(process.stdin, process.stdout);

class Transaction{
    constructor(fromAddress, toAddress, amount){
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }
}

class Block {
    constructor(timestamp, transactions, previousHash = '') {
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash() {
        return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
    }

    mineBlock(difficulty) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.calculateHash();
        }

        console.log("BLOCK VALIDÁLVA: " + this.hash);
    }
}


class Blockchain{
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 4;
        this.pendingTransactions = [];
        this.miningReward = 0.1;
    }

    createGenesisBlock() {
        return new Block(Date.parse("2018-05-18"), [], "Keszitette: Daghefli Akram");
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    minePendingTransactions(miningRewardAddress){
        let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);

        console.log('Block sikeresen validáva lett!');
        this.chain.push(block);

        this.pendingTransactions = [
            new Transaction(null, miningRewardAddress, this.miningReward)
        ];
    }

    createTransaction(transaction){
        this.pendingTransactions.push(transaction);
    }

    getBalanceOfAddress(address){
        let balance = 0;

        for(const block of this.chain){
            for(const trans of block.transactions){
                if(trans.fromAddress === address){
                    balance -= trans.amount;
                }

                if(trans.toAddress === address){
                    balance += trans.amount;
                }
            }
        }

        return balance;
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }

        return true;
    }
}

let menedekCoin = new Blockchain();
rl.question("Add meg a jelszvad: ", function(name){
    console.log('\nAz azonosítód:');
    console.log(SHA256(name).toString());
    rl.close();
});

rl.question("Mit szeretnél csinálni? Írd be a válaszodnak megfelelő számot. A lehetőségeid:\n -Alaprismeretek szerzése(1)\n -Számla lehívása(2)\n -Utalás(3)\n -Tranzakciók hitelesítése(4)\n", function(valasz) {
    if (valasz === 2) {
        rl.question("Írd be a jelszavad: ", function(azonosito) {
            menedekCoin.getBalanceOfAddress(SHA256(azonosito).toString());
        });
    };

    if (valasz === 3) {
        rl.question("Írd be a jelszavad ", function(azonosito) {
            rl.question("Írd be a kedvezményezett azonosítóját: ", function(celszemely) {
                rl.question("Írd be az utalni kívánt összeget", function(osszeg) {
                    if (osszeg < getBalanceOfAddress(azonosito)) {
                        menedekCoin.createTransaction(new Transaction(azonosito, celszemely, osszeg));
                    };
                    console.log('Az utalni kívánt összegnél kevesebb valuta van a számládon.')  ;              
                });
            });
        });
    };

    if (valasz === 4) {
        rl.question('Írd be a jelszavad: ', function(azonosito) {
            menedekCoin.minePendingTransactions(azonosito);
        });
    };
})
