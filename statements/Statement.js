"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Statement {
}
exports.default = Statement;
(function (Statement) {
    class Super extends Statement {
        constructor() {
            super(...arguments);
            this.parallelOperations = [];
            this.standaloneOperations = [];
        }
        addParallelOperation(...operations) {
            this.parallelOperations.push(...operations);
            return this;
        }
        addStandaloneOperation(...operations) {
            this.standaloneOperations.push(...operations);
            return this;
        }
        compile() {
            const operations = this.compileStandaloneOperations();
            const parallelOperations = this.compileParallelOperations().join(",");
            if (parallelOperations)
                operations.unshift(parallelOperations);
            return operations.map(operation => this.compileOperation(operation));
        }
        compileParallelOperations() {
            return this.parallelOperations.flatMap(operation => operation.compile());
        }
        compileStandaloneOperations() {
            return this.standaloneOperations.flatMap(operation => operation.compile());
        }
    }
    Statement.Super = Super;
})(Statement || (Statement = {}));
