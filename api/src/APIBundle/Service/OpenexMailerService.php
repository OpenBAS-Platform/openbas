<?php

namespace APIBundle\Service;

use Symfony\Bundle\TwigBundle\TwigEngine;
use Symfony\Component\Translation\Translator;

class OpenexMailerService {
    private $mailer;
    private $engine;
    private $translator;

    const FROM = 'no-reply@openex.io';
    const FROM_NAME = 'OpenEx';
    const EMAIL = 'contact@luatix.org';

    function __construct(\Swift_Mailer $mailer, TwigEngine $engine, Translator $translator) {
        $this->mailer = $mailer;
        $this->engine = $engine;
        $this->translator = $translator;
    }

    public function sendEmailWithMessage($email, $subject, $message, $from = self::FROM, $from_name = self::FROM_NAME) {
        $message = \Swift_Message::newInstance()
            ->setSubject($this->translator->trans($subject))
            ->setFrom($from, $from_name)
            ->setTo($email)
            ->setBcc(self::EMAIL)
            ->setCharset("utf-8")
            ->setContentType("text/html")
            ->setBody($message);
        $this->mailer->send($message);
    }

    public function sendEmailWithTemplate($email, $subject, $template, $params) {
        $renderedMessage = $this->engine->render($template, $params);
        self::sendEmailWithMessage($email, $subject, $renderedMessage);
    }
}