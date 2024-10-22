import {
  House,
  ShoppingCart,
  Package,
  Archive,
  ChartSpline,
  Users,
  BadgeDollarSign,
  CreditCard,
  BadgeHelp,
  ReceiptText,
} from "lucide-react";

export const sidebarMenu = [
  {
    title: "Home",
    icon: <House className="size-5" />,
    path: "/dashboard/home",
  },
  {
    title: "Orders",
    icon: <ShoppingCart className="size-5" />,
    path: "/dashboard/orders",
  },
  {
    title: "Inventory",
    icon: <Archive className="size-5" />,
    path: "/dashboard/inventory",
  },
  {
    title: "Analytics",
    icon: <ChartSpline className="size-5" />,
    path: "/dashboard/analytics",
  },
  {
    title: "Customer Management",
    icon: <Users className="size-5" />,
    path: "/dashboard/customer-management",
  },
  {
    title: "Promotions & Discounts",
    icon: <BadgeDollarSign className="size-5" />,
    path: "/dashboard/promotions-discounts",
  },
  // {
  //   title: "Billings and Payments",
  //   icon: <CreditCard className="size-5" />,
  //   path: "/dashboard/billings-payments",
  // },
  {
    title: "Help Center",
    icon: <BadgeHelp className="size-5" />,
    path: "/dashboard/help",
  },
  {
    title: "Terms and Policies",
    icon: <ReceiptText className="size-5" />,
    path: "/dashboard/terms-policies",
  },
];

export const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
