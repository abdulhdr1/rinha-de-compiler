import { rm } from "node:fs/promises";
import { Operation, Program, Term } from "./types";

const fileName = "fib";

async function main() {
	console.time(fileName);
	const astFile = Bun.file(`./files/${fileName}.json`);

	const ast: Program = JSON.parse(await astFile.text());

	const result = evaluate(ast);

	Bun.write(`./files/${fileName}.js`, result);
	console.timeEnd(fileName);
}

function evaluate(ast: Program): string {
	if (ast.expression) {
		return evaluateTerm(ast.expression);
	} else {
		throw new Error("Malformed AST");
	}
}

const operations: { [Op in Operation]: string } = {
	Add: "+",
	Sub: "-",
	Mul: "*",
	Div: "/",
	Rem: "%",
	Eq: "==",
	Neq: "!=",
	Lt: "<",
	Gt: ">",
	Lte: "<=",
	Gte: ">=",
	And: "&&",
	Or: "||",
};

function evaluateTerm(term: Term, isInsideFn = false): string {
	switch (term.kind) {
		case "String":
			return term.value;
		case "Var":
			return term.text;
		case "Function":
			const functionParams = term.parameters
				.map((p) => p.text)
				.join(", ");

			const functionBody =
				term.value.kind === "Let"
					? evaluateTerm(term.value, true)
					: `return ${evaluateTerm(term.value)}`;

			return `function (${functionParams}) {${functionBody}}`;
		case "Call":
			const callee = evaluateTerm(term.callee);
			const args = term.arguments
				.map((a: Term) => evaluateTerm(a))
				.join(", ");
			return `${callee}(${args})`;
		case "Binary":
			const lhs = evaluateTerm(term.lhs);
			const rhs = evaluateTerm(term.rhs);
			const op = operations[term.op];
			return `${lhs} ${op} ${rhs}`;
		case "Let":
			const name = term.name.text;
			const value = evaluateTerm(term.value);
			let next = evaluateTerm(term.next);

			if (isInsideFn) {
				next =
					term.next.kind === "Let"
						? evaluateTerm(term.next, true)
						: `return ${evaluateTerm(term.next)}`;
			}

			return `let ${name} = ${value}; ${next}`;
		case "If":
			const condition = evaluateTerm(term.condition);
			const then = evaluateTerm(term.then);
			const otherwise = evaluateTerm(term.otherwise);
			return `(${condition}) ? (${then}) : (${otherwise})`;
		case "Print":
			return `console.log(${evaluateTerm(term.value)})`;
		case "Bool":
			return String(term.value);
		case "Int":
			return String(term.value);
		default:
			const _exhaustiveCheck: never = term;
			throw new Error("Invalid term kind");
	}
}

main();
