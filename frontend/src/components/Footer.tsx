function Footer() {
  return (
    <footer className="bg-karspex-cream border-t border-karspex-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Desktop & Tablet Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-bold text-karspex-black mb-4">Spexadmin</h3>
            <p className="text-karspex-gray-800 text-sm">Ett administrationssystem för spex</p>
          </div>

          {/* Quick Links */}
          <div className="md:col-start-3 md:text-right">
            <h3 className="text-lg font-bold text-karspex-black mb-4">Snabblänkar</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/"
                  className="text-karspex-gray-800 hover:text-karspex-gold transition-colors duration-200 text-sm"
                >
                  Välkommen
                </a>
              </li>
              <li>
                <a
                  href="/bli-spexare"
                  className="text-karspex-gray-800 hover:text-karspex-gold transition-colors duration-200 text-sm"
                >
                  Bli spexare
                </a>
              </li>
              <li>
                <a
                  href="/produktioner"
                  className="text-karspex-gray-800 hover:text-karspex-gold transition-colors duration-200 text-sm"
                >
                  Produktioner
                </a>
              </li>
              <li>
                <a
                  href="/webbutik"
                  className="text-karspex-gray-800 hover:text-karspex-gold transition-colors duration-200 text-sm"
                >
                  Webbutik
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-karspex-gray-100">
          <p className="text-center text-karspex-gray-800 text-sm">
            &copy; {new Date().getFullYear()} Spexadmin. Alla rättigheter förbehållna.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
