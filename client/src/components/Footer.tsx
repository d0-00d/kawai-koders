// client/src/components/Footer.tsx
const Footer = () => {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 py-8 text-center mt-auto">
      <p className="text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} Kohnrad SaaS. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
