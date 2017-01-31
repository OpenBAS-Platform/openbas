<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20170131141344 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('DROP TABLE users_audiences');
        $this->addSql('ALTER TABLE dryinjects_statuses CHANGE status_name status_name ENUM(\'SUCCESS\', \'PARTIAL\', \'ERROR\', \'PENDING\')');
        $this->addSql('ALTER TABLE grants CHANGE grant_name grant_name ENUM(\'ADMIN\', \'PLANNER\', \'PLAYER\', \'OBSERVER\')');
        $this->addSql('ALTER TABLE injects_statuses CHANGE status_name status_name ENUM(\'SUCCESS\', \'PARTIAL\', \'ERROR\', \'PENDING\')');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE users_audiences (audience_id VARCHAR(255) NOT NULL COLLATE utf8_unicode_ci, user_id VARCHAR(255) NOT NULL COLLATE utf8_unicode_ci, INDEX IDX_6EE2E028848CC616 (audience_id), INDEX IDX_6EE2E028A76ED395 (user_id), PRIMARY KEY(audience_id, user_id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE users_audiences ADD CONSTRAINT FK_6EE2E028848CC616 FOREIGN KEY (audience_id) REFERENCES audiences (audience_id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE users_audiences ADD CONSTRAINT FK_6EE2E028A76ED395 FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE dryinjects_statuses CHANGE status_name status_name VARCHAR(255) DEFAULT NULL COLLATE utf8_unicode_ci');
        $this->addSql('ALTER TABLE grants CHANGE grant_name grant_name VARCHAR(255) DEFAULT NULL COLLATE utf8_unicode_ci');
        $this->addSql('ALTER TABLE injects_statuses CHANGE status_name status_name VARCHAR(255) DEFAULT NULL COLLATE utf8_unicode_ci');
    }
}
