import { Observable, map, pipe } from "rxjs";
import { Bus, Err, Ok, Res, unwrapPipe } from "../public-api";

export namespace quco {
    export type Collection = string;
    export type Query  = any;
    export type NewQuery = Query;
    export type SearchQuery = Query;
    export type UpdQuery = Query;
    export type DelQuery = Query;

    const CODE_PREFIX = "orwynn_quco::";

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
        sq: SearchQuery
    ): Observable<Res<T[]>> {
        return Bus.ie.pub$(
            CODE_PREFIX + "get",
            {
                collection: collection,
                sq: sq
            }
        ).pipe(
            unpackUnits()
        );
    }

    export function getOne$<T>(
        collection: Collection,
        sq: SearchQuery
    ): Observable<Res<T>> {
        return Bus.ie.pub$(
            CODE_PREFIX + "get",
            {
                collection: collection,
                sq: sq
            }
        ).pipe(
            unpackFirstUnit()
        );
    }

    export function getOneUnwrap$<T>(
        collection: Collection,
        sq: SearchQuery
    ): Observable<T> {
        return getOne$<T>(
            collection,
            sq
        ).pipe(
            unwrapPipe()
        );
    }

    export function getManyUnwrap$<T>(
        collection: Collection,
        sq: SearchQuery
    ): Observable<T[]> {
        return getMany$<T>(
            collection,
            sq
        ).pipe(
            unwrapPipe()
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
            unpackFirstUnit()
        );
    }

    export function upd$<T>(
        collection: Collection,
        sq: SearchQuery,
        uq: UpdQuery
    ): Observable<Res<number>> {
        return Bus.ie.pub$(
            CODE_PREFIX + "new",
            {
                collection: collection,
                sq: sq,
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

    export function del$<T>(
        collection: Collection,
        sq: SearchQuery,
        uq: UpdQuery
    ): Observable<Res<number>> {
        return Bus.ie.pub$(
            CODE_PREFIX + "new",
            {
                collection: collection,
                sq: sq,
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
                let count = extra.deld_count;
                if (count === undefined) {
                    return Err(`extra ${extra} must contain "deld_count"`);
                }
                return Ok(count);
            })
        );
    }
}
