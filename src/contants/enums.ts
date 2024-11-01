export enum Status {
    Sold = "sold",
    Active = "active",
    Inactive = "inactive",
    Esign = "esign",
    SoldEsign = "sold-esign",
    PendingEsign = "pending-esign",
    PendingCare="pending-care",
    Care="care",
    DoneCare = "done-care",
    WaitingReceive="waiting-receive",
}

export enum Role {
    Customer = "customer",
    Manager = "manager",
    Staff = "staff",
}

export enum PoolType {
    General = "general",
    Specific = "specific",
}

export enum PoolStatus {
    Pending = "pending",
    Available = "available",
    Inactive = "inactive",
}

export enum EsignStatus {
    Sold = 'sold',
    Processing = 'processing',
    Shipping = 'shipping',
    Pending = 'pending',
    Paid = 'paid',
    Done ="done",
    Confirm="confirm"
}

export enum FishStatus {
    Healthy = "healthy",
    Sick = "sick"
}

export enum OrderEsignDetailStatus {
    Sold = 'sold',
    Processing = 'processing',
    Shipping = 'shipping',
    Pending = 'pending',
}


export enum OrderStatus {
    Shipping = 'shipping',
    Completed = 'completed',
    Processing = 'processing',
    Accident = 'accident',
    Paid = 'paid',
    Cancel='cancel',
    Esgin='esign'
}

export enum OrderEsginType {
    OnlineSale="online-sale",
    OfflineSale="offline-sale",
    Care ="care"
}