import { v4 as uuid } from "uuid";

export function uuid4(): string {
    return uuid().replaceAll("-", "");
}
