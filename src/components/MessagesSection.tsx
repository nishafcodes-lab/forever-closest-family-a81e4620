import { MessageCircle, Heart, Quote } from "lucide-react";

const messages = [
  {
    author: "From the Batch",
    message: "To all our teachers who believed in us even when we didn't believe in ourselves – Thank you for everything! 💜",
  },
  {
    author: "To Our Friends",
    message: "Distance may separate us, but the memories we created will keep us connected forever. Here's to friendship that lasts a lifetime!",
  },
  {
    author: "To The Future",
    message: "We came as strangers, grew as classmates, and left as family. BSCS 2021-2025 – Forever in our hearts! ❤️",
  },
];

const MessagesSection = () => {
  return (
    <section id="messages" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm font-medium">From The Heart</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold gradient-text mb-4">
            Messages & Wishes
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Words from our hearts to yours
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {messages.map((msg, index) => (
            <div
              key={index}
              className="group glass-card rounded-2xl p-8 card-shadow hover:card-shadow-hover transition-all duration-500 relative"
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/20" />
              <h4 className="font-display text-lg font-semibold text-primary mb-4">
                {msg.author}
              </h4>
              <p className="text-muted-foreground leading-relaxed italic">
                "{msg.message}"
              </p>
            </div>
          ))}
        </div>

        {/* Send Message CTA */}
        <div className="glass-card rounded-2xl p-8 md:p-12 text-center max-w-2xl mx-auto">
          <Heart className="w-12 h-12 mx-auto mb-4 text-accent" />
          <h3 className="font-display text-2xl font-semibold mb-3">
            Share Your Message
          </h3>
          <p className="text-muted-foreground mb-6">
            Have something special to say to your classmates or teachers? We'd love to hear from you!
          </p>
          <button className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:opacity-90 transition-all duration-300 shadow-lg">
            <MessageCircle className="w-4 h-4" />
            Send a Message
          </button>
        </div>
      </div>
    </section>
  );
};

export default MessagesSection;
