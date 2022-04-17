
var Resources = getResources();

function getResources() {
    var Icons = {
        RecordDateTime: "fas fa-clock",
        Speed: "fas fa-tachometer-alt",
        Direction: "fab fa-safari",
        EngineStatus: "fab fa-whmcs",
        VehicleStatus: "fas fa-wifi",
        Mileage: "fas fa-expand-alt",
        Duration: "far fa-hourglass",
        DriverUrl: "far fa-user",
        GroupName: "fas fa-users-cog",
        PlateNumber: "fab fa-deploydog",
        SimCardNumber: "fas fa-sim-card",
        SerialNumber: "fas fa-barcode",
        IgnitionStatus: "fas fa-plug",
        weightreading: "fas fa-weight-hanging",
        Temp: "fas fa-temperature-low",
        HUM: "fas fa-wind",
        Address: "fas fa-map-marked-alt"
    };
    var resources = {
        Tips: {
            RecordDateTime: "Record Date",
            Speed: "Speed",
            Direction: "Direction",
            EngineStatus: "Engine Status",
            VehicleStatus: "Vehicle Status",
            Mileage: "Mileage",
            Duration: "Duration",
            DriverUrl: "Driver Name",
            GroupName: "Group Name",
            PlateNumber: "Plate Number",
            SimCardNumber: "Sim Number",
            SerialNumber: "Serial Number",
            IgnitionStatus: "Ignition Control",
            weightreading: "Actual Weight",
            Temp: "Temperature Sensor 1",
            HUM: "Humidity Sensor 1",
            Address: "Address",
            NA: "Not Available",
            DriverNA: "No Driver",
            AllGroups: "All Groups"
        },
        Icons: Icons,
        Actions: {
            Title: "Options",
            FullHistory: "Full History PlayBack",
            EditInformation: "Edit Information",
            CalibrateMileage: "Calibrate Mileage",
            CalibrateWeight: "Calibrate Weight",
            ShareLocation: "Share Location",
            SubmitCommand: "Submit New Command",
            DisableVehicle: "Disable Vehicle",
            EnableVehicle: "Enable Vehicle"
        },
        guides: {
            SelectPOint: "Please Select A point",
            NameRequired: "Please Enter the name",
            Processing: "Processing"
        },
        Status: {
            EngineOn: "On",
            EngineOff: "Off",
            VehicleOffline: "Offline",
            VehicleOverSpeed: "Over Speed",
            VehicleOverStreetSpeed: "OverStreet Speed",
            VehicleStopped: "Stopped",
            VehicleRunning: "Running",
            VehicleIdle: "Idle",
            VehicleInvalid: "Invalid Status",
            IgnitionEnabled: "Installed",
            IgnitionDisabled: "Not Installed"
        },
        paymentLabels: {
            cardNumber: "Card Number",
            expirationDate: "MM/YY",
            cvv: "CVV",
            cardHolder: "Card Holder Name"
        }
    };

    if ($("body").attr("data-lang") == 'ar') {
        resources = {
            Tips: {
                RecordDateTime: "تاريخ الحركة",
                Speed: "السرعة",
                Direction: "الاتجاه",
                EngineStatus: "حالة المحرك",
                VehicleStatus: "حالة المركبات",
                Mileage: "الاميال (كم)",
                Duration: "المدة",
                DriverUrl: "اسم السائق",
                GroupName: "اسم المجموعة",
                PlateNumber: "رقم اللوحة",
                SimCardNumber: "الرقم التسلسلي للشريحة",
                SerialNumber: "الرقم التسلسلي للجهاز",
                IgnitionStatus: "جهاز تحكم التشغيل",
                weightreading: "الوزن الفعلي",
                Temp: "حساس الحرارة 1",
                HUM: "حساس الرطوبة 1",
                Address: "العنوان",
                NA: "غير متاح",
                DriverNA: "غير معرف",
                AllGroups: "الجميع"
            },
            Icons: Icons,
            Actions: {
                Title: "خيارات",
                FullHistory: "تتبع التاريخ كاملا للمركبة",
                EditInformation: "تحرير معلومات المركبة",
                CalibrateMileage: "إعادة تعيين الأميال",
                CalibrateWeight: "إعادة تعين اعدادات الوزن",
                ShareLocation: "مشاركة الموقع",
                SubmitCommand: "تقديم امر جديد",
                DisableVehicle: "ايقاف التشغيل",
                EnableVehicle: "السماح بالتشغيل"
            },
            guides: {
                SelectPOint: "الرجاء اختيار الموقع",
                NameRequired: "الرجاء ادخال الاسم",
                Processing: "تحميل"
            },
            Status: {
                EngineOn: "تعمل",
                EngineOff: "لا تعمل",
                VehicleOffline: "مطفئة",
                VehicleOverSpeed: "تجاوز السرعة",
                VehicleOverStreetSpeed: "تجاوز سرعة الطريق",
                VehicleStopped: "متوقفة",
                VehicleRunning: "تسير",
                VehicleIdle: "سكون",
                VehicleInvalid: "حالة مجهولة",
                IgnitionEnabled: "مركب",
                IgnitionDisabled: "غير مركب"
            },
            paymentLabels: {
                cardNumber: "رقم البطاقة",
                expirationDate: "MM/YY",
                cvv: "CVV",
                cardHolder: "اسم حامل البطاقة"
            }
        };
    }

    return resources;
}