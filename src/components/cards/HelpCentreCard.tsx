"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { ChevronRightIcon, X } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem } from "../ui/accordion";
import { AccordionTrigger } from "@radix-ui/react-accordion";
import ReactMarkdown from "react-markdown";

const HelpCentreCard = ({
  title,
  description,
  topics,
}: {
  title: string;
  description: string;
  topics: {
    title: string;
    description: string;
  }[];
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.div layoutId={title} className="h-full">
        <Card
          className="p-5 hover:cursor-pointer flex flex-col gap-5 h-full"
          onClick={() => setIsOpen(!isOpen)}
        >
          <motion.div
            layoutId={`${title}-header`}
            className="flex w-full justify-between"
          >
            <motion.h3
              className="text-sm font-medium"
              layoutId={`${title}-title`}
            >
              {title}{" "}
            </motion.h3>
            <ChevronRightIcon className="w-4 h-4" />
          </motion.div>
          <motion.p
            layoutId={`${title}-description`}
            className="text-xs text-gray-500"
          >
            {description}
          </motion.p>
        </Card>
      </motion.div>
      {isOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/50 z-50 flex justify-center items-center">
          <motion.div
            className="p-5 bg-white rounded-xl w-[40vw] max-md:w-[90vw] h-[80vh] overflow-y-auto"
            layoutId={title}
          >
            <motion.div
              layoutId={`${title}-header`}
              className="flex flex-col w-full items-center mb-5 p-3"
            >
              <div className=" flex w-full justify-between items-center">
                <div />
                <motion.h3
                  layoutId={`${title}-title`}
                  className="text-2xl max-md:text-base font-bold "
                >
                  {title}
                </motion.h3>
                <X
                  className="w-4 h-4 hover:cursor-pointer"
                  onClick={() => setIsOpen(false)}
                />
              </div>
            </motion.div>
            <hr className="w-full border-gray-400 my-5" />
            <motion.p
              layoutId={`${title}-description`}
              className="text-sm text-gray-500"
            >
              {description}
            </motion.p>
            <motion.ul className="flex flex-col gap-2 my-10">
              <Accordion
                type="single"
                collapsible
                className="w-full flex flex-col gap-5"
                defaultValue={"0"}
              >
                {topics.map((topic, index) => (
                  <AccordionItem key={index} value={index.toString()}>
                    <AccordionTrigger className="my-2 no-focus">
                      <h1 className="font-semibold max-md:text-sm">
                        {index + 1}. {topic.title}
                      </h1>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p>
                        <ReactMarkdown className="markdown">
                          {topic.description}
                        </ReactMarkdown>
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.ul>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default HelpCentreCard;
