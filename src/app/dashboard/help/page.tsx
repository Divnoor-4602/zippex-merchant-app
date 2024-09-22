"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SearchIcon, PhoneIcon, BellIcon } from "lucide-react";
import helpCenter from "@/constants/help-center";
import HelpCentreCard from "@/components/cards/HelpCentreCard";

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredHelpCenter, setFilteredHelpCenter] = useState<any>(helpCenter);
  const faqs = [
    {
      question: "How do I update my store hours?",
      answer:
        "You can update your store hours in the 'Store Settings' section of your merchant dashboard.",
    },
    {
      question: "What do I do if an item is out of stock?",
      answer:
        "Mark the item as 'Unavailable' in your inventory management system to prevent customers from ordering it.",
    },
    {
      question: "How long does it take to receive payments?",
      answer:
        "Payments are typically processed within 2-3 business days after the order is completed.",
    },
  ];

  const filteredInventory = (searchQuery: string) => {
    if (searchQuery === "") {
      setFilteredHelpCenter(helpCenter);
      return helpCenter;
    }
    setFilteredHelpCenter(() => {
      const bufferedObject: { [key: string]: number } = {};
      const bufferedArray: { [key: string]: number }[] = [];
      Object.keys(helpCenter).map((item) => {
        if (
          helpCenter[item as keyof typeof helpCenter].title
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          helpCenter[item as keyof typeof helpCenter].description
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        ) {
          bufferedObject[item] = bufferedObject[item]
            ? bufferedObject[item]++
            : 0;
        }
        helpCenter[item as keyof typeof helpCenter].topics.map((topic) => {
          if (
            topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            topic.description.toLowerCase().includes(searchQuery.toLowerCase())
          ) {
            bufferedObject[item] = bufferedObject[item]
              ? bufferedObject[item]++
              : 0;
          }
        });
      });
      return bufferedObject;
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Merchant Help Center
      </h1>

      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Search for help..."
          value={searchQuery}
          onChange={(e) => {
            filteredInventory(e.target.value);
            setSearchQuery(e.target.value);
          }}
          className="pl-10 pr-4 py-2 w-full no-focus"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 auto-rows-auto gap-4">
        {Object.keys(filteredHelpCenter).length === 0 && (
          <div className="w-full md:col-span-3 text-center text-gray-500 flex items-center justify-center">
            No results found for &quot;{searchQuery}&quot;
          </div>
        )}
        {filteredHelpCenter &&
          Object.keys(filteredHelpCenter).map((item) => {
            return (
              <HelpCentreCard
                key={item}
                title={helpCenter[item as keyof typeof helpCenter].title}
                description={
                  helpCenter[item as keyof typeof helpCenter].description
                }
                topics={helpCenter[item as keyof typeof helpCenter].topics}
              />
            );
          })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <Button className="flex items-center space-x-2">
          <PhoneIcon className="w-4 h-4" />
          <span>Contact Support</span>
        </Button>
        <Card className="w-64">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <BellIcon className="w-4 h-4" />
              <span>Recent Updates</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              New feature: Bulk order processing now available!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
