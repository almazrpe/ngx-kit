import { Observable, map, pipe } from "rxjs";
import { Bus, Err, Ok, Res, pipeUnwrap } from "../public-api";

export namespace quco {
    export type Collection = string;

    export interface Query {
        [key: string]: any
    }

    export enum UpdQueryTopLevelOps {
        Set = "$set",
        Push = "$push",
        Pull = "$pull"
    }

    export type NewQuery = Query;
    export type GetQuery = Query;
    export type UpdQuery = Query;
    export type DelQuery = Query;

    const CODE_PREFIX = "quco::";

    function unpackFirstUnit() {
        return pipe(
            unpackUnits(),
            map(units => {
                if (units.is_err()) {
                    return units;
                }
                let unpacked_units = units.ok;
                if (unpacked_units.length == 0) {
                    return Err("no units found");
                }

                // we don't care if there are more units, take only the first
                return Ok(unpacked_units[0]);
            })
        );
    }

    function unpackUnits() {
        return pipe(
            map((val: Res<any>) => {
                if (val.is_err()) {
                    return val;
                }
                let units = val.ok.units;
                if (units === undefined) {
                    return Err(`incorrect got collection message ${val.ok}`);
                }
                if (!(units instanceof Array)) {
                    return Err(`incorrect got collection units ${units}`);
                }
                // we ok if units are empty
                return Ok(units);
            })
        );
    }

    export function getMany$<T>(
        collection: Collection,
        gq: GetQuery = {}
    ): Observable<Res<T[]>> {
        return Bus.ie.pub$(
            CODE_PREFIX + "get",
            {
                collection: collection,
                gq: gq
            }
        ).pipe(
            unpackUnits()
        );
    }

    export function getOne$<T>(
        collection: Collection,
        gq: GetQuery = {}
    ): Observable<Res<T>> {
        return Bus.ie.pub$(
            CODE_PREFIX + "get",
            {
                collection: collection,
                gq: gq
            }
        ).pipe(
            unpackFirstUnit()
        );
    }

    export function getOneUnwrap$<T>(
        collection: Collection,
        gq: GetQuery = {}
    ): Observable<T> {
        return getOne$<T>(
            collection,
            gq
        ).pipe(
            pipeUnwrap()
        );
    }

    export function getManyUnwrap$<T>(
        collection: Collection,
        gq: GetQuery = {}
    ): Observable<T[]> {
        return getMany$<T>(
            collection,
            gq
        ).pipe(
            pipeUnwrap()
        );
    }

    export function new$<T>(
        collection: Collection,
        nq: NewQuery
    ): Observable<Res<T[]>> {
        return Bus.ie.pub$(
            CODE_PREFIX + "new",
            {
                collection: collection,
                nq: nq
            }
        ).pipe(
            unpackUnits()
        );
    }

    export function upd$(
        collection: Collection,
        gq: GetQuery,
        uq: UpdQuery
    ): Observable<Res<number>> {
        return Bus.ie.pub$(
            CODE_PREFIX + "new",
            {
                collection: collection,
                gq: gq,
                uq: uq
            }
        ).pipe(
            map((val: Res<any>) => {
                if (val.is_err()) {
                    return val;
                }
                let extra = val.ok.extra;
                if (extra === undefined) {
                    return Err(`incorrect got collection message ${val.ok}`);
                }
                let updCount = extra.upd_count;
                if (updCount === undefined) {
                    return Err(`extra ${extra} must contain "upd_count"`);
                }
                return Ok(updCount);
            })
        );
    }

    export function del$(
        collection: Collection,
        gq: GetQuery
    ): Observable<Res<number>> {
        return Bus.ie.pub$(
            CODE_PREFIX + "new",
            {
                collection: collection,
                gq: gq
            }
        ).pipe(
            map((val: Res<any>) => {
                if (val.is_err()) {
                    return val;
                }
                let extra = val.ok.extra;
                if (extra === undefined) {
                    return Err(`incorrect got collection message ${val.ok}`);
                }
                let count = extra.deld_count;
                if (count === undefined) {
                    return Err(`extra ${extra} must contain "deld_count"`);
                }
                return Ok(count);
            })
        );
    }
}
