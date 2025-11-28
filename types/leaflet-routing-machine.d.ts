import "leaflet";

declare module "leaflet" {
  namespace Routing {
    function control(options: any): L.Routing.Control;
    function osrmv1(options?: any): any;
    interface Control extends L.Control {}
  }
}
