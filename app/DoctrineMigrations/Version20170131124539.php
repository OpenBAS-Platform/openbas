<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20170131124539 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE subaudiences (subaudience_id VARCHAR(255) NOT NULL, subaudience_audience VARCHAR(255) DEFAULT NULL, subaudience_name VARCHAR(255) NOT NULL, subaudience_enabled TINYINT(1) NOT NULL, INDEX IDX_9CF031F069138C0B (subaudience_audience), PRIMARY KEY(subaudience_id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE users_subaudiences (subaudience_id VARCHAR(255) NOT NULL, user_id VARCHAR(255) NOT NULL, INDEX IDX_CFB417FCCB0CA5A3 (subaudience_id), INDEX IDX_CFB417FCA76ED395 (user_id), PRIMARY KEY(subaudience_id, user_id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE injects_subaudiences (inject_id VARCHAR(255) NOT NULL, subaudience_id VARCHAR(255) NOT NULL, INDEX IDX_96E1B96C7983AEE (inject_id), INDEX IDX_96E1B96CCB0CA5A3 (subaudience_id), PRIMARY KEY(inject_id, subaudience_id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE subaudiences ADD CONSTRAINT FK_9CF031F069138C0B FOREIGN KEY (subaudience_audience) REFERENCES audiences (audience_id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE users_subaudiences ADD CONSTRAINT FK_CFB417FCCB0CA5A3 FOREIGN KEY (subaudience_id) REFERENCES subaudiences (subaudience_id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE users_subaudiences ADD CONSTRAINT FK_CFB417FCA76ED395 FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE injects_subaudiences ADD CONSTRAINT FK_96E1B96C7983AEE FOREIGN KEY (inject_id) REFERENCES injects (inject_id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE injects_subaudiences ADD CONSTRAINT FK_96E1B96CCB0CA5A3 FOREIGN KEY (subaudience_id) REFERENCES subaudiences (subaudience_id) ON DELETE CASCADE');
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

        $this->addSql('ALTER TABLE users_subaudiences DROP FOREIGN KEY FK_CFB417FCCB0CA5A3');
        $this->addSql('ALTER TABLE injects_subaudiences DROP FOREIGN KEY FK_96E1B96CCB0CA5A3');
        $this->addSql('DROP TABLE subaudiences');
        $this->addSql('DROP TABLE users_subaudiences');
        $this->addSql('DROP TABLE injects_subaudiences');
        $this->addSql('ALTER TABLE dryinjects_statuses CHANGE status_name status_name VARCHAR(255) DEFAULT NULL COLLATE utf8_unicode_ci');
        $this->addSql('ALTER TABLE grants CHANGE grant_name grant_name VARCHAR(255) DEFAULT NULL COLLATE utf8_unicode_ci');
        $this->addSql('ALTER TABLE injects_statuses CHANGE status_name status_name VARCHAR(255) DEFAULT NULL COLLATE utf8_unicode_ci');
    }
}
