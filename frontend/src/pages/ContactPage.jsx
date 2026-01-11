import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { API } from "../App";
import { toast } from "sonner";
import {
  Mail,
  MessageSquare,
  Clock,
  MapPin,
  Send,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API}/contact`, formData);
      toast.success("Message sent successfully! We'll get back to you soon.");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      value: "moammdsal@gmail.com",
      description: "We'll respond within 24 hours",
    },
    {
      icon: MessageSquare,
      title: "Phone",
      value: "+972 59-995-0104",
      description: "Call us anytime",
    },
    {
      icon: Clock,
      title: "Response Time",
      value: "< 2 Hours",
      description: "Average response time",
    },
    {
      icon: MapPin,
      title: "Service Area",
      value: "Worldwide",
      description: "Global digital services",
    },
  ];

  const faqs = [
    {
      question: "How long does delivery take?",
      answer: "Most digital products are delivered instantly or within 24 hours. Specific delivery times are mentioned on each product page.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, debit cards, and various digital payment methods through our secure Stripe checkout.",
    },
    {
      question: "Is my payment information secure?",
      answer: "Yes, absolutely! We use 256-bit SSL encryption and never store your payment details. All transactions are processed securely through Stripe.",
    },
    {
      question: "What if I don't receive my order?",
      answer: "If you don't receive your order within the specified delivery time, please contact our support team immediately. We guarantee delivery or a full refund.",
    },
    {
      question: "Can I get a refund?",
      answer: "We offer refunds for orders that weren't delivered or didn't meet our quality standards. Please contact support within 48 hours of your purchase.",
    },
    {
      question: "How do I track my order?",
      answer: "You can track all your orders in your dashboard. We also send email updates about your order status.",
    },
  ];

  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="font-orbitron text-4xl sm:text-5xl font-bold text-white mb-4">
            GET IN <span className="gradient-text">TOUCH</span>
          </h1>
          <p className="text-white/50 max-w-2xl mx-auto">
            Have questions or need assistance? We're here to help 24/7.
            Reach out to us through any of the channels below.
          </p>
        </motion.div>

        {/* Contact Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {contactInfo.map((info, index) => (
            <div key={info.title} className="glass-card rounded-2xl p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-[#00f3ff]/20 flex items-center justify-center mx-auto mb-4">
                <info.icon className="w-6 h-6 text-[#00f3ff]" />
              </div>
              <h3 className="font-orbitron font-bold text-white mb-1">{info.title}</h3>
              <p className="text-[#00f3ff] font-medium mb-1">{info.value}</p>
              <p className="text-white/40 text-sm">{info.description}</p>
            </div>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="glass-card rounded-2xl p-8">
              <h2 className="font-orbitron text-2xl font-bold text-white mb-6">
                SEND US A <span className="text-[#bc13fe]">MESSAGE</span>
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/60 text-sm mb-2 block">Name</label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      required
                      className="h-12 bg-white/5 border-white/10 rounded-xl"
                      data-testid="contact-name"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-sm mb-2 block">Email</label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      required
                      className="h-12 bg-white/5 border-white/10 rounded-xl"
                      data-testid="contact-email"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-white/60 text-sm mb-2 block">Subject</label>
                  <Input
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="How can we help?"
                    required
                    className="h-12 bg-white/5 border-white/10 rounded-xl"
                    data-testid="contact-subject"
                  />
                </div>

                <div>
                  <label className="text-white/60 text-sm mb-2 block">Message</label>
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us more about your inquiry..."
                    required
                    rows={5}
                    className="bg-white/5 border-white/10 rounded-xl resize-none"
                    data-testid="contact-message"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 gradient-btn rounded-xl text-black font-bold"
                  data-testid="contact-submit"
                >
                  {loading ? (
                    <div className="spinner w-5 h-5 border-black"></div>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </div>
          </motion.div>

          {/* FAQs */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <HelpCircle className="w-6 h-6 text-[#00f3ff]" />
              <h2 className="font-orbitron text-2xl font-bold text-white">
                FREQUENTLY ASKED <span className="text-[#00f3ff]">QUESTIONS</span>
              </h2>
            </div>

            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`faq-${index}`}
                  className="glass-card rounded-xl border-none px-6"
                >
                  <AccordionTrigger className="text-white hover:no-underline py-4 text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-white/60 pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {/* Support Note */}
            <div className="mt-8 p-6 bg-[#00f3ff]/10 rounded-xl border border-[#00f3ff]/20">
              <h3 className="font-orbitron font-bold text-[#00f3ff] mb-2">
                Need Immediate Help?
              </h3>
              <p className="text-white/60 text-sm">
                Our support team is available 24/7. For urgent issues, 
                use our live chat feature for instant assistance.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
