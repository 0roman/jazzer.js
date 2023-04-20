/*
 * Copyright 2023 Code Intelligence GmbH
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

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { FuzzedDataProvider } = require("@jazzer.js/core");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const root = require("global-modules-path");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { exec } = require("child_process");

module.exports.fuzz = function (data) {
	const provider = new FuzzedDataProvider(data);
	exec(provider.consumeString(provider.consumeIntegralInRange(1, 20)));
	const str1 = provider.consumeString(provider.consumeIntegralInRange(1, 20));
	const str2 = provider.consumeRemainingAsString();
	root.getPath(str1, str2);
};
