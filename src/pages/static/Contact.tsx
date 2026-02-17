import { ArrowLeft, Mail, MessageSquare, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const Contact = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">

                <div className="mb-8">
                    <Link to="/" className="inline-flex items-center text-sm text-gray-500 hover:text-[#00141e] transition-colors mb-6">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Home
                    </Link>
                    <div className="text-center max-w-3xl mx-auto">
                        <h1 className="text-3xl sm:text-4xl font-black text-[#00141e] mb-4">
                            Get in Touch
                        </h1>
                        <p className="text-gray-500 text-lg">
                            Have a question, suggestion, or just want to say hello? We'd love to hear from you.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Contact Info */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <Mail className="w-8 h-8 text-[#ff0046] mb-4" />
                            <h3 className="font-bold text-[#00141e] text-lg mb-2">Email Us</h3>
                            <p className="text-sm text-gray-600 mb-4">For general inquiries and support.</p>
                            <a href="#" className="text-[#ff0046] hover:underline font-medium">support@livescoresresult.com</a>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <MessageSquare className="w-8 h-8 text-[#ff0046] mb-4" />
                            <h3 className="font-bold text-[#00141e] text-lg mb-2">Feedback</h3>
                            <p className="text-sm text-gray-600 mb-4">Help us improve our platform.</p>
                            <a href="#" className="text-[#ff0046] hover:underline font-medium">feedback@livescoresresult.com</a>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <Phone className="w-8 h-8 text-[#ff0046] mb-4" />
                            <h3 className="font-bold text-[#00141e] text-lg mb-2">Advertising</h3>
                            <p className="text-sm text-gray-600 mb-4">For partnership opportunities.</p>
                            <a href="#" className="text-[#ff0046] hover:underline font-medium">sales@livescoresresult.com</a>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                        <h2 className="text-2xl font-bold text-[#00141e] mb-6">Send us a message</h2>
                        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-sm font-medium text-gray-700">Name</label>
                                    <Input id="name" placeholder="Your name" />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
                                    <Input id="email" type="email" placeholder="your@email.com" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="subject" className="text-sm font-medium text-gray-700">Subject</label>
                                <Input id="subject" placeholder="What is this about?" />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="message" className="text-sm font-medium text-gray-700">Message</label>
                                <Textarea id="message" placeholder="Type your message here..." className="min-h-[150px]" />
                            </div>
                            <Button type="submit" className="w-full bg-[#00141e] hover:bg-[#002535] text-white">
                                Send Message
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
