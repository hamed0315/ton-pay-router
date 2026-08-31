
CREATE TABLE IF NOT EXISTS faq (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL
);
INSERT INTO faq (question, answer) VALUES 
('How do I create an invoice?', 'Use the /v2/invoices API or the dashboard.'),
('Which chains are supported?', 'Currently TON and EVM chains (Base, Polygon, Ethereum, BNB).'),
('What fees do you charge?', 'We charge a spread and a fixed fee per transaction.');
