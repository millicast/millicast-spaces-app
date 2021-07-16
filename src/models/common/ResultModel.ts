import ErrorModel from './ErrorModel';
export default class ResultModel<T> {
    public Error: ErrorModel
    public content: T
}