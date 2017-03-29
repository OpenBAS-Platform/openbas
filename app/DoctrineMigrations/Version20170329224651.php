<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20170329224651 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('UPDATE injects_statuses SET status_name = NULL WHERE status_name = \'PENDING\'');
        $this->addSql('UPDATE dryinjects_statuses SET status_name = NULL WHERE status_name = \'PENDING\'');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('UPDATE injects_statuses SET status_name = \'PENDING\' WHERE status_name IS NULL');
        $this->addSql('UPDATE dryinjects_statuses SET status_name = \'PENDING\' WHERE status_name IS NULL');
    }
}
