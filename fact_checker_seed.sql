-- both test users have the password "password"

INSERT INTO users (username, password, firstName, lastName, email, isAdmin)
VALUES ('tom', 'password', 'Tom', 'Smith', 'tom@example.com', false),
       ('larry', 'password', 'Larry', 'Smith', 'larry@example.com', false),
       ('admin', 'password', 'Adam', 'Smith', 'admin@example.com', true);

INSERT INTO topics (name)
VALUES ('french revolution'),
       ('napoleon'),
       ('france'),
       ('louis xiv'),
       ('gatsby'),
       ('peace'),
       ('anna karenina');

INSERT INTO posts (username, topicName, date, content)
VALUES
('tom', 'napoleon', '2025-01-09', 'Napoleon Bonaparte (born Napoleone di Buonaparte; 15 August 1769 – 5 May 1821), later known by his regnal name Napoleon I, was a French military officer and statesman who rose to prominence during the French Revolution and led a series of successful campaigns across Europe during the French Revolutionary and Napoleonic Wars from 1796 to 1815. He was the leader of the French Republic as First Consul from 1799 to 1804, then of the French Empire as Emperor of the French from 1804 to 1814, and briefly again in 1815.'),
('tom', 'napoleon', '2025-01-09', 'Born on the island of Corsica to a family of Italian origin, Napoleon moved to mainland France in 1779 and was commissioned as an officer in the French Royal Army in 1785. He supported the French Revolution in 1789, and promoted its cause in Corsica. He rose rapidly through the ranks after winning the siege of Toulon in 1793 and defeating royalist insurgents in Paris on 13 Vendémiaire in 1795. In 1796, Napoleon commanded a military campaign against the Austrians and their Italian allies in the War of the First Coalition, scoring decisive victories and becoming a national hero.'),
('larry', 'napoleon', '2025-01-09', 'The breakdown of the Treaty of Amiens led to the War of the Third Coalition by 1805. Napoleon shattered the coalition with a decisive victory at the Battle of Austerlitz, which led to the dissolution of the Holy Roman Empire. In the War of the Fourth Coalition, Napoleon defeated Prussia at the Battle of Jena–Auerstedt in 1806, marched his Grande Armée into Eastern Europe, and defeated the Russians in 1807 at the Battle of Friedland. Seeking to extend his trade embargo against Britain, Napoleon invaded the Iberian Peninsula and installed his brother Joseph as King of Spain in 1808, provoking the Peninsular War. In 1809, the Austrians again challenged France in the War of the Fifth Coalition.');