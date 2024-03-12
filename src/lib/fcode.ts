export interface AnyConstructor
{
  new (...args: any[]): any;
}

export class FcodeCore
{
  private static _ie: FcodeCore;

  private activeCodeToConstructor: { [key: string]: AnyConstructor } = {};
  private legacyCodeToConstructor: { [key: string]: AnyConstructor } = {};
  private _deflock: boolean = false;

  private constructor()
  {
  }

  public static get ie(): FcodeCore
  {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    return this._ie || (this._ie = new this());
  }

  public get deflock(): boolean
  {
    return this._deflock;
  }

  public set deflock(v: boolean)
  {
    this._deflock = v;
  }

  public tryGetConstructorForAnyCodes(
    anycodes: string[]
  ): AnyConstructor | undefined
  {
    for (const anycode of anycodes)
    {
      if (anycode in this.activeCodeToConstructor)
      {
        return this.activeCodeToConstructor[anycode];
      }
      if (anycode in this.legacyCodeToConstructor)
      {
        return this.legacyCodeToConstructor[anycode];
      }
    }
  }

  public tryGetActiveCodeForConstructor(
    constructor: AnyConstructor
  ): string | undefined
  {
    for (
      const [code, _constructor] of Object.entries(
        this.activeCodeToConstructor
      )
    )
    {
      if (_constructor === constructor)
      {
        return code;
      }
    }
  }

  public defcode(
    code: string, constructor: AnyConstructor, legacyCodes?: string[]
  ): void
  {
    if (this._deflock)
    {
      throw new Error("def of new codes");
    }

    if (code in this.activeCodeToConstructor)
    {
      throw new Error(code);
    }

    const legacyCodesToAdd: string[] = [];
    if (legacyCodes !== undefined)
    {
      for (const lc of legacyCodes)
      {
        if (lc in this.legacyCodeToConstructor)
        {
          throw new Error(code);
        }
        legacyCodesToAdd.push(lc);
      }
    }

    this.activeCodeToConstructor[code] = constructor;
    for (const lc in legacyCodesToAdd)
    {
      this.legacyCodeToConstructor[lc] = constructor;
    }
  }
}

export function code(
  code: string,
  legacyCodes?: string[]
): (constructor: AnyConstructor) => any
{
  return (constructor: AnyConstructor) => 
  {
    FcodeCore.ie.defcode(code, constructor, legacyCodes);
  };
}

