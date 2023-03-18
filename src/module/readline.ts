import readline from "readline";
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

export function readlineQuestion(question: string) {
    return new Promise((resolve, reject) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}
