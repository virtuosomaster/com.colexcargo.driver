export class AuthConstants {
    public static readonly AUTH = 'userDataKey';
    public static readonly STATUS = 'status';
    public static readonly SHIPPER_FIELDS = 'podShipperFields';
    public static readonly RECEIVER_FIELDS = 'podReceiverFields';
    public static readonly DELIVER_ROUTE = 'podDeliverRoute';
    public static readonly CANCELLED_ROUTE = 'podCancelledRoute';
    public static readonly UNREQUIRED_FIELDS = 'unRequired';
    public static readonly SIGN_FIELDS = 'signFields';
    public static readonly DRIVER_DELIVER_ROUTE = 'deliveryRoute';
    public static readonly DRIVER_DWAYPOINTS = 'deliveryRouting';
    public static readonly DRIVER_DELIVER_PICKUPROUTE = 'pickupRoute';
    public static readonly DRIVER_PWAYPOINTS = 'pickupRouting';
    public static readonly CUSTOM_SECTIONS_TO_HIDE = ['cod_settlement', 'courier_charge'];
}