import { rm } from "node:fs/promises";
import { Operation, File, Term } from "./types";

const filePath = Bun.argv[2];
const file = Bun.file(filePath);
if (!(await file.exists())) throw new Error("File does not exist");
main(JSON.parse(await file.text()) as File);

async function main(file: File) {
	const result = evaluate(file);

	Bun.write(`./out.js`, result);
}

function evaluate(ast: File): string {
	if (ast.expression) {
		return evaluateTerm(ast.expression);
	} else {
		throw new Error("Malformed AST");
	}
}

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
			switch (term.op) {
				case "Add":
					return `${lhs} + ${rhs}`;
				case "Sub":
					return `${lhs} - ${rhs}`;
				case "Mul":
					return `${lhs} * ${rhs}`;
				case "Div":
					return `${lhs} / ${rhs}`;
				case "Rem":
					return `${lhs} % ${rhs}`;
				case "Eq":
					return `${lhs} == ${rhs}`;
				case "Neq":
					return `${lhs} != ${rhs}`;
				case "Lt":
					return `${lhs} < ${rhs}`;
				case "Gt":
					return `${lhs} > ${rhs}`;
				case "Lte":
					return `${lhs} <= ${rhs}`;
				case "Gte":
					return `${lhs} >= ${rhs}`;
				case "And":
					return `${lhs} && ${rhs}`;
				case "Or":
					return `${lhs} || ${rhs}`;
				default:
					const _exhaustiveCheck: never = term.op;
					throw new Error("Invalid operation");
			}
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
		case "Tuple":
			return `[${term.first}, ${term.second}]`;
		case "First":
			if (term.value.kind === "Tuple") {
				return evaluateTerm(term.value.first);
			}

			throw new Error("Invalid use of First on non Tuple value");
		case "Second":
			if (term.value.kind === "Tuple") {
				return evaluateTerm(term.value.second);
			}
			throw new Error("Invalid use of Second on non Tuple value");
		default:
			const _exhaustiveCheck: never = term;
			throw new Error("Invalid term kind");
	}
}
