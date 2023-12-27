import { UnsupportedError } from "./err";

/**
 * Host DTO is the outermost JSON body object sent from backend services.
 */
export interface HostDTO<TDTO = any>  // `any` type for legacy support
{
    type: HostDTOType;
    value: TDTO;
}

export enum HostDTOType
{
    OK = "ok",
    ERROR = "error"
}

export interface UnitDTO
{
    id: string;
    code: string | null;
}

export interface ContainerDTO
{
    units: UnitDTO[];
}

export abstract class DTOUtils
{
  public static convertMany<T>(
    hostdto: HostDTO<ContainerDTO>,
    convertionFunc: (unit: UnitDTO) => T
  ): T[];
  public static convertMany<T>(
    units: UnitDTO[],
    convertionFunc: (unit: UnitDTO) => T
  ): T[];
  /**
   * Converts items array into typescript objects using a convertion function.
   *
   * @param units dto units array to convert
   * @param convertionFunc convertion function to use for each item in the
   *                       array
   * @returns array of typescript converted objects
   */
  public static convertMany<T>(
    data: HostDTO<ContainerDTO> | UnitDTO[],
    convertionFunc: (unit: UnitDTO) => T
  ): T[]
  {
    if (this.isHostDTO(data))
    {
      return this.convertMany<T>(data.value.units, convertionFunc);
    }

    if (Array.isArray(data) && data.length > 0 && this.isUnitDTO(data[0]))
    {
      const result: T[] = [];

      for (const unit of data)
      {
        result.push(convertionFunc(unit));
      }

      return result;
    }

    throw new UnsupportedError("convertMany data " + JSON.stringify(data));
  }

  public static isHostDTO(obj: object): obj is HostDTO
  {
    return Object.hasOwn(obj, "type") && Object.hasOwn(obj, "value");
  }

  public static isUnitDTO(obj: object): obj is UnitDTO
  {
    return Object.hasOwn(obj, "id");
  }
}
