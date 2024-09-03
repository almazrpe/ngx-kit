export function pubGetDocsReq$<TRetUdto>(
    req: GetDocsReq,
    opts: PubOpts = {}
): Observable<TRetUdto[]> {
    return Bus.ie.pub$(req, opts).pipe(
        map(rae => (rae.evt as any).udtos)
    );
}

export function pubGetDocReq$<TRetUdto>(
    req: GetDocsReq,
    opts: PubOpts = {}
): Observable<TRetUdto> {
    return Bus.ie.pub$(req, opts).pipe(
        // warning is no more for arr.length > 1
        map(rae => ArrUtils.getFirst((rae.evt as any).udtos, false))
    );
}

export function pubCreateDocReq$<TRetUdto>(
    req: CreateDocReq,
    opts: PubOpts = {}
): Observable<TRetUdto> {
    return Bus.ie.pub$(req, opts).pipe(
        map(rae => (rae.evt as any).udto)
    );
}

export function pubUpdDocReq$<TRetUdto>(
    req: UpdDocReq,
    opts: PubOpts = {}
): Observable<TRetUdto> {
    return Bus.ie.pub$(
        req, opts
    ).pipe(map(rae => (rae.evt as any).udto));
}

export function pubDelDocReq$(
    req: DelDocReq,
    opts: PubOpts = {}
): Observable<void> {
    return Bus.ie.pub$(req, opts)
        .pipe(
            map(_ => {
 return; 
})
        );
}
