export function constructUrl(
  host: string,
  port: number | string,
  route?: string
): string 
{
  // check if the port is parseable
  if (typeof port === "string") 
  {
    Number.parseInt(port);
  }

  if (route === undefined) 
  {
    route = "";
  }
  else if (route[0] !== "/" && route !== "") 
  {
    route = "/" + route;
  }

  return `http://${host}:${port}${route}`;
}
