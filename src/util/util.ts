export default class Util {
    public static CreateModel(instance: any): any {
        let obj = {}
        for (let fn in instance) {
            if (typeof(fn) == 'function') {
                obj[instance[fn]] = instance[fn]
            }
        }
        return obj
    }
}