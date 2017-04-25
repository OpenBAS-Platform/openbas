<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20170330215331 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE dryinjects_statuses CHANGE status_date status_date DATETIME DEFAULT NULL');
        $this->addSql('UPDATE dryinjects_statuses SET status_date = NULL WHERE status_name IS NULL');

        $this->addSql('ALTER TABLE injects_statuses CHANGE status_date status_date DATETIME DEFAULT NULL');
        $this->addSql('UPDATE injects_statuses SET status_date = NULL WHERE status_name IS NULL');

    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('UPDATE dryinjects_statuses SET status_date = NOW() WHERE status_name IS NULL');
        $this->addSql('ALTER TABLE dryinjects_statuses CHANGE status_date status_date DATETIME NOT NULL');

        $this->addSql('UPDATE injects_statuses SET status_date = NOW() WHERE status_name IS NULL');
        $this->addSql('ALTER TABLE injects_statuses CHANGE status_date status_date DATETIME NOT NULL');
    }
}
