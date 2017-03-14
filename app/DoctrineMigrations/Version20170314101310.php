<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20170314101310 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('UPDATE injects SET inject_type = \'openex_email\' WHERE inject_type = \'email\'');
        $this->addSql('UPDATE injects SET inject_type = \'openex_ovh_sms\' WHERE inject_type = \'ovh-sms\'');
        $this->addSql('UPDATE dryinjects SET dryinject_type = \'openex_email\' WHERE dryinject_type = \'email\'');
        $this->addSql('UPDATE dryinjects SET dryinject_type = \'openex_ovh_sms\' WHERE dryinject_type = \'ovh-sms\'');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('UPDATE injects SET inject_type = \'email\' WHERE inject_type = \'openex_email\'');
        $this->addSql('UPDATE injects SET inject_type = \'ovh-sms\' WHERE inject_type = \'openex_ovh_sms\'');
        $this->addSql('UPDATE dryinjects SET dryinject_type = \'email\' WHERE dryinject_type = \'openex_email\'');
        $this->addSql('UPDATE dryinjects SET dryinject_type = \'ovh-sms\' WHERE dryinject_type = \'openex_ovh_sms\'');
    }
}
