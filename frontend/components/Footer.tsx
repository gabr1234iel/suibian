import React from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Twitter,
  Github,
  MessageSquare,
  Mail,
  ExternalLink,
  Heart,
  Zap,
  Shield,
  Users,
  BarChart3,
  Globe,
} from "lucide-react";
import logo from "../assets/logo.png";

const Footer: React.FC = () => {
  const SuiBianLogo = (
    <img src={logo.src} alt="SuiBian Logo" className="w-7 h-7" />
  );

  const footerLinks = {
    product: [
      { name: "Marketplace", href: "#marketplace" },
      { name: "Create Agent", href: "#create" },
      { name: "Dashboard", href: "#dashboard" },
      { name: "Analytics", href: "#analytics" },
    ],
    developers: [
      { name: "Documentation", href: "docs" },
      { name: "API Reference", href: "#api" },
      { name: "SDKs", href: "#sdks" },
      { name: "Examples", href: "#examples" },
    ],
    community: [
      { name: "Discord", href: "#discord" },
      { name: "Twitter", href: "#twitter" },
      { name: "Blog", href: "#blog" },
      { name: "Newsletter", href: "#newsletter" },
    ],
    company: [
      { name: "About", href: "#about" },
      { name: "Careers", href: "#careers" },
      { name: "Privacy", href: "#privacy" },
      { name: "Terms", href: "#terms" },
    ],
  };

  const socialLinks = [
    {
      name: "Twitter",
      icon: <Twitter className="w-5 h-5" />,
      href: "#twitter",
      color: "hover:text-blue-400",
    },
    {
      name: "Github",
      icon: <Github className="w-5 h-5" />,
      href: "#github",
      color: "hover:text-white",
    },
    {
      name: "Discord",
      icon: <MessageSquare className="w-5 h-5" />,
      href: "#discord",
      color: "hover:text-indigo-400",
    },
    {
      name: "Email",
      icon: <Mail className="w-5 h-5" />,
      href: "#email",
      color: "hover:text-emerald-400",
    },
  ];

  const stats = [
    {
      label: "Total Volume",
      value: "$2.4B+",
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      label: "Active Users",
      value: "50K+",
      icon: <Users className="w-5 h-5" />,
    },
    {
      label: "Trading Agents",
      value: "1.2K+",
      icon: <Zap className="w-5 h-5" />,
    },
    { label: "Countries", value: "100+", icon: <Globe className="w-5 h-5" /> },
  ];

  return (
    <footer className="relative border-t border-white/10 px-6 py-20 bg-black overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-10 left-20 w-64 h-64 bg-gradient-radial from-white/3 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />

        <motion.div
          className="absolute bottom-10 right-20 w-80 h-80 bg-gradient-radial from-gray-500/3 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 px-6">
        {/* Stats Section */}
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 pb-16 border-b border-white/10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="text-white">{stat.icon}</div>
                  <motion.div
                    className="text-2xl md:text-3xl font-bold text-white"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {stat.value}
                  </motion.div>
                </div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-12 mb-16">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <motion.div
                className="flex items-center space-x-3 mb-6 group cursor-pointer"
                whileHover={{ scale: 1.02 }}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                {SuiBianLogo}
                <span className="text-2xl font-bold text-white">SuiBian</span>
              </motion.div>

              <motion.p
                className="text-sm leading-relaxed mb-6 max-w-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                The future of decentralized trading. Build, deploy, and monetize
                AI-powered trading agents on the Sui blockchain.
              </motion.p>

              {/* Social Links */}
              <motion.div
                className="flex items-center space-x-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
              >
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    className={`w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-text-muted ${social.color} transition-all duration-300 group hover:border-white/30 hover:bg-white/10`}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </motion.div>
            </div>

            {/* Link Sections */}
            {Object.entries(footerLinks).map(
              ([category, links], categoryIndex) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                  viewport={{ once: true }}
                >
                  <h4 className="text-white font-semibold mb-6 capitalize">
                    {category}
                  </h4>
                  <ul className="space-y-3">
                    {links.map((link, index) => (
                      <motion.li
                        key={link.name}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.4,
                          delay: categoryIndex * 0.1 + index * 0.05,
                        }}
                        viewport={{ once: true }}
                      >
                        <motion.a
                          href={link.href}
                          className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                          whileHover={{ x: 4 }}
                        >
                          <span>{link.name}</span>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </motion.a>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )
            )}
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="mb-16 p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h3 className="text-xl font-bold text-white mb-2">
                  Stay Updated
                </h3>
                <p className="text-text-secondary">
                  Get the latest news and updates from SuiBian
                </p>
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-80">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-gradient-blue focus:border-transparent transition-all duration-300"
                  />
                </div>
                <motion.button
                  className="px-6 py-3 bg-white text-black border-2 border-white rounded-2xl font-semibold hover:bg-gray-100 transition-all duration-300 whitespace-nowrap"
                  whileTap={{ scale: 0.95 }}
                >
                  Subscribe
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="flex items-center gap-2 text-text-muted mb-4 md:mb-0"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <span>© 2025 SuiBian. Made with</span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Heart className="w-4 h-4 text-red-400 fill-red-400" />
              </motion.div>
              <span>for the DeFi community</span>
            </motion.div>

            <motion.div
              className="flex items-center gap-6 text-sm text-text-muted"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-white" />
                <span>Secured by Sui</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-white" />
                <span>Lightning Fast</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
