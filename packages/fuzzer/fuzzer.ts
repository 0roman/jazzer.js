/*
 * Copyright 2022 Code Intelligence GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { addon, StartFuzzingAsyncFn, StartFuzzingSyncFn } from "./addon";
import {
	incrementCounter,
	initializeCounters,
	nextCounter,
	readCounter,
} from "./coverage";

initializeCounters();

/**
 * Performs a string comparison between two strings and calls the corresponding native hook if needed.
 * This function replaces the original comparison expression and preserves the semantics by returning
 * the original result after calling the native hook.
 * @param s1 first compared string
 * @param s2 second compared string
 * @param operator the operator used in the comparison
 * @param id an unique identifier to distinguish between the different comparisons
 * @returns result of the comparison
 */
function traceStrCmp(
	s1: string,
	s2: string,
	operator: string,
	id: number
): boolean {
	let result = false;
	let shouldCallLibfuzzer = false;
	switch (operator) {
		case "==":
			result = s1 == s2;
			shouldCallLibfuzzer = !result;
			break;
		case "===":
			result = s1 === s2;
			shouldCallLibfuzzer = !result;
			break;
		case "!=":
			result = s1 != s2;
			shouldCallLibfuzzer = result;
			break;
		case "!==":
			result = s1 !== s2;
			shouldCallLibfuzzer = result;
			break;
	}
	if (shouldCallLibfuzzer && s1 && s2) {
		addon.traceUnequalStrings(id, s1, s2);
	}
	return result;
}

/**
 * Performs an integer comparison between two strings and calls the corresponding native hook if needed.
 * This function replaces the original comparison expression and preserves the semantics by returning
 * the original result after calling the native hook.
 * @param n1 first compared number
 * @param n2 second compared number
 * @param operator the operator used in the comparison
 * @param id an unique identifier to distinguish between the different comparisons
 * @returns result of the comparison
 */
function traceNumberCmp(
	n1: number,
	n2: number,
	operator: string,
	id: number
): boolean {
	if (Number.isInteger(n1) && Number.isInteger(n2)) {
		addon.traceIntegerCompare(id, n1, n2);
	}
	switch (operator) {
		case "==":
			return n1 == n2;
		case "===":
			return n1 === n2;
		case "!=":
			return n1 != n2;
		case "!==":
			return n1 !== n2;
		case ">":
			return n1 > n2;
		case ">=":
			return n1 >= n2;
		case "<":
			return n1 < n2;
		case "<=":
			return n1 <= n2;
		default:
			throw `unexpected number comparison operator ${operator}`;
	}
}

function traceAndReturn(current: unknown, target: unknown, id: number) {
	switch (typeof target) {
		case "number":
			if (typeof current === "number") {
				if (Number.isInteger(current) && Number.isInteger(target)) {
					addon.traceIntegerCompare(id, current, target);
				}
			}
			break;
		case "string":
			if (typeof current === "string") {
				addon.traceUnequalStrings(id, current, target);
			}
	}
	return target;
}

export type {
	FuzzTarget,
	FuzzTargetAsyncOrValue,
	FuzzTargetCallback,
} from "./addon";

export { addon } from "./addon";

export interface Fuzzer {
	printVersion: () => void;
	startFuzzing: StartFuzzingSyncFn;
	startFuzzingAsync: StartFuzzingAsyncFn;
	stopFuzzingAsync: (status?: number) => void;
	nextCounter: typeof nextCounter;
	incrementCounter: typeof incrementCounter;
	readCounter: typeof readCounter;
	traceStrCmp: typeof traceStrCmp;
	traceNumberCmp: typeof traceNumberCmp;
	traceAndReturn: typeof traceAndReturn;
}

export const fuzzer: Fuzzer = {
	printVersion: addon.printVersion,
	startFuzzing: addon.startFuzzing,
	startFuzzingAsync: addon.startFuzzingAsync,
	stopFuzzingAsync: addon.stopFuzzingAsync,
	nextCounter,
	incrementCounter,
	readCounter,
	traceStrCmp,
	traceNumberCmp,
	traceAndReturn,
};
