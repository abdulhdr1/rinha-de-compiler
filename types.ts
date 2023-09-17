export type Location = {
	start: number;
	end: number;
	filename: string;
};
export type Operation =
	| "Add" // Add, +
	| "Sub" // Subtract, -
	| "Mul" // Multiply, *
	| "Div" // Divide, /
	| "Rem" // Rem, %
	| "Eq" // Equal, ==
	| "Neq" // Not equal, !=
	| "Lt" // Less than, <
	| "Gt" // Greater than, >
	| "Lte" // Less than or equal to, <=
	| "Gte" // Greater than or equal to, =>
	| "And" // And, &&
	| "Or"; // Or, ||

export type Parameter = {
	text: string;
	location: Location;
};

export type Term =
	| {
			// Literal Bool, true
			kind: "Bool";
			value: boolean;
			location: Location;
	  }
	| {
			// Literal Int32, 123
			kind: "Int";
			value: number;
			location: Location;
	  }
	| {
			// Literal String, "abc"
			kind: "String";
			value: string;
			location: Location;
	  }
	| {
			// Variable, x
			kind: "Var";
			text: string;
			location: Location;
	  }
	| {
			// Function Expression, fn (x, y) => value
			kind: "Function";
			parameters: Parameter[];
			value: Term;
			location: Location;
	  }
	| {
			// Function Call, callee(arg, 1, "b")
			kind: "Call";
			callee: Term;
			arguments: Term[];
			location: Location;
	  }
	| {
			// Binary Operation, lhs + rhs
			kind: "Binary";
			lhs: Term;
			op: Operation;
			rhs: Term;
			location: Location;
	  }
	| {
			// Let Expression, let x = value; next
			kind: "Let";
			name: Parameter;
			value: Term;
			next: Term;
			location: Location;
	  }
	| {
			// If Expression, if (condition) { then } else { otherwise }
			kind: "If";
			condition: Term;
			then: Term;
			otherwise: Term;
			location: Location;
	  }
	| {
			// Print, print("a")
			kind: "Print";
			value: Term;
			location: Location;
	  }
	| {
			kind: "Tuple";
			first: Term;
			second: Term;
			location: Location;
	  }
	| {
			kind: "First";
			value: Term;
			location: Location;
	  }
	| {
			kind: "Second";
			value: Term;
			location: Location;
	  };
export type File = {
	name: String;
	expression: Term;
	location: Location;
};
